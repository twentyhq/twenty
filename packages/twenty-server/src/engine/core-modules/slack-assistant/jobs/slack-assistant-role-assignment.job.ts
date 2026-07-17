import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  SLACK_ASSISTANT_ROLE_ASSIGNMENT_JOB_NAME,
  SLACK_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/engine/core-modules/slack-assistant/constants/slack-assistant.constants';
import { type SlackAssistantRoleAssignmentJobData } from 'src/engine/core-modules/slack-assistant/types/slack-assistant-role-assignment-job.type';
import { AiAgentRoleService } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.service';

@Processor({ queueName: MessageQueue.aiQueue })
export class SlackAssistantRoleAssignmentJob {
  private readonly logger = new Logger(SlackAssistantRoleAssignmentJob.name);

  constructor(private readonly aiAgentRoleService: AiAgentRoleService) {}

  @Process(SLACK_ASSISTANT_ROLE_ASSIGNMENT_JOB_NAME)
  async handle({
    workspaceId,
    agentId,
  }: SlackAssistantRoleAssignmentJobData): Promise<void> {
    // Idempotent: keep any role already assigned (e.g. an admin widened it to
    // allow writes) rather than overriding a manual choice.
    const existingRoleId = await this.aiAgentRoleService.getAssignedRoleId({
      workspaceId,
      agentId,
    });

    if (isDefined(existingRoleId)) {
      return;
    }

    const roleId = await this.aiAgentRoleService.getRoleIdByUniversalIdentifier({
      workspaceId,
      universalIdentifier: SLACK_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER,
    });

    // The role is synced alongside the agent, so a miss is most likely a
    // transient cache gap right after install — throw so the queue retries.
    if (!isDefined(roleId)) {
      throw new Error(
        `Slack Assistant role not yet available in workspace ${workspaceId}`,
      );
    }

    await this.aiAgentRoleService.assignRoleToAgent({
      workspaceId,
      agentId,
      roleId,
    });

    this.logger.log(
      `Assigned the Slack Assistant role to agent ${agentId} in workspace ${workspaceId}.`,
    );
  }
}
