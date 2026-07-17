import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { fromApplicationEntityToFlatApplication } from 'src/engine/core-modules/application/utils/from-application-entity-to-flat-application.util';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildApplicationAuthContext } from 'src/engine/core-modules/auth/utils/build-application-auth-context.util';
import { SlackApplicationResolverService } from 'src/engine/core-modules/slack-assistant/services/slack-application-resolver.service';
import { SlackConnectionService } from 'src/engine/core-modules/slack-assistant/services/slack-connection.service';
import { SlackThreadSubscriptionService } from 'src/engine/core-modules/slack-assistant/services/slack-thread-subscription.service';
import { postSlackMessage } from 'src/engine/core-modules/slack-assistant/utils/post-slack-message.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AiAgentRoleService } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.service';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const SLACK_ASSISTANT_AGENT_NAME = 'slack-assistant';

const SLACK_MAX_MARKDOWN_TEXT_LENGTH = 12000;
const SLACK_TRUNCATION_NOTICE = '\n\n_(response truncated)_';

type GraphemeSegmenter = {
  segment: (input: string) => Iterable<{ segment: string }>;
};

const segmentGraphemes = (text: string): string[] => {
  const segmenter = new (
    Intl as unknown as {
      Segmenter: new (
        locales?: string,
        options?: { granularity: 'grapheme' },
      ) => GraphemeSegmenter;
    }
  ).Segmenter(undefined, { granularity: 'grapheme' });

  return [...segmenter.segment(text)].map(({ segment }) => segment);
};

const truncateForSlack = (text: string): string => {
  const graphemes = segmentGraphemes(text);

  if (graphemes.length <= SLACK_MAX_MARKDOWN_TEXT_LENGTH) {
    return text;
  }

  return (
    graphemes
      .slice(0, SLACK_MAX_MARKDOWN_TEXT_LENGTH - SLACK_TRUNCATION_NOTICE.length)
      .join('') + SLACK_TRUNCATION_NOTICE
  );
};

const MISSING_ROLE_REPLY =
  "I don't have access to your CRM right now. The *Slack Assistant* role may " +
  'not be assigned yet; an admin can assign it to the *slack-assistant* agent ' +
  'to restore my access.';

@Injectable()
export class SlackAssistantService {
  private readonly logger = new Logger(SlackAssistantService.name);

  constructor(
    private readonly agentService: AgentService,
    private readonly agentAsyncExecutorService: AgentAsyncExecutorService,
    private readonly aiAgentRoleService: AiAgentRoleService,
    private readonly slackApplicationResolverService: SlackApplicationResolverService,
    private readonly slackConnectionService: SlackConnectionService,
    private readonly slackThreadSubscriptionService: SlackThreadSubscriptionService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async answerInThread({
    workspaceId,
    teamId,
    channelId,
    threadTs,
    text,
  }: {
    workspaceId: string;
    teamId: string;
    channelId: string;
    threadTs: string;
    text: string;
  }): Promise<void> {
    const botToken = await this.slackConnectionService.getBotToken({
      workspaceId,
      teamId,
    });

    if (!isDefined(botToken)) {
      this.logger.warn(
        `No Slack connection for workspace ${workspaceId}; cannot reply.`,
      );

      return;
    }

    let agent: AgentEntity;

    try {
      agent = await this.agentService.findOneAgentByName({
        name: SLACK_ASSISTANT_AGENT_NAME,
        workspaceId,
      });
    } catch (error) {
      if (
        error instanceof AiException &&
        error.code === AiExceptionCode.AGENT_NOT_FOUND
      ) {
        this.logger.warn(
          `The ${SLACK_ASSISTANT_AGENT_NAME} agent does not exist in workspace ${workspaceId}; is twenty-slack fully installed?`,
        );

        return;
      }

      throw error;
    }

    const agentRoleId = await this.aiAgentRoleService.getAssignedRoleId({
      workspaceId,
      agentId: agent.id,
    });

    if (!isDefined(agentRoleId)) {
      await postSlackMessage({
        token: botToken,
        channel: channelId,
        threadTs,
        markdownText: MISSING_ROLE_REPLY,
      });

      return;
    }

    const authContext = await this.resolveApplicationAuthContext({
      workspaceId,
      roleId: agentRoleId,
    });

    if (!isDefined(authContext)) {
      this.logger.warn(
        `Could not resolve an application auth context for workspace ${workspaceId}; the assistant cannot run CRM tools.`,
      );

      return;
    }

    const executionResult = await this.agentAsyncExecutorService.executeAgent({
      agent,
      userPrompt: text,
      authContext,
      workspaceId,
      operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
    });

    const replyText = this.extractReplyText(executionResult.result);

    if (!isNonEmptyString(replyText)) {
      this.logger.warn(
        `Agent produced no text reply for workspace ${workspaceId}.`,
      );

      return;
    }

    await postSlackMessage({
      token: botToken,
      channel: channelId,
      threadTs,
      markdownText: truncateForSlack(replyText),
    });

    await this.slackThreadSubscriptionService.subscribe({
      teamId,
      channelId,
      threadTs,
    });
  }

  private async resolveApplicationAuthContext({
    workspaceId,
    roleId,
  }: {
    workspaceId: string;
    roleId: string;
  }): Promise<WorkspaceAuthContext | null> {
    const application =
      await this.slackApplicationResolverService.findInstalledApplication(
        workspaceId,
      );

    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (!isDefined(application) || !isDefined(workspace)) {
      return null;
    }

    return buildApplicationAuthContext({
      workspace: fromWorkspaceEntityToFlat(workspace),
      application: {
        ...fromApplicationEntityToFlatApplication(application),
        defaultRoleId: roleId,
      },
    });
  }

  private extractReplyText(result: object): string | null {
    if ('response' in result && isNonEmptyString(result.response)) {
      return result.response;
    }

    return null;
  }
}
