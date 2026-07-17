import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import {
  SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/engine/core-modules/slack-assistant/constants/slack-assistant.constants';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import { AiAgentRoleService } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.service';

// Grants the slack-assistant agent its shipped read-only role the moment the
// twenty-slack app is installed, so the assistant works out of the box (the
// role can't currently be assigned to an application agent from the UI).
//
// This only reacts to agent *creation*, so it runs once on install and never on
// re-sync/upgrade — an admin who later changes the role is never overridden.
@Injectable()
export class SlackAssistantAgentCreatedListener {
  private readonly logger = new Logger(SlackAssistantAgentCreatedListener.name);

  constructor(private readonly aiAgentRoleService: AiAgentRoleService) {}

  @OnEvent('metadata.agent.created')
  async handleAgentCreated(
    batch: MetadataEventBatch<AllMetadataName, 'created'>,
  ): Promise<void> {
    const slackAssistantAgentIds = batch.events
      .filter(
        (event) =>
          'after' in event.properties &&
          event.properties.after.universalIdentifier ===
            SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
      )
      .map((event) => event.recordId);

    for (const agentId of slackAssistantAgentIds) {
      await this.assignShippedRole({
        workspaceId: batch.workspaceId,
        agentId,
      });
    }
  }

  private async assignShippedRole({
    workspaceId,
    agentId,
  }: {
    workspaceId: string;
    agentId: string;
  }): Promise<void> {
    try {
      const existingRoleId = await this.aiAgentRoleService.getAssignedRoleId({
        workspaceId,
        agentId,
      });

      if (isDefined(existingRoleId)) {
        return;
      }

      const roleId =
        await this.aiAgentRoleService.getRoleIdByUniversalIdentifier({
          workspaceId,
          universalIdentifier: SLACK_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER,
        });

      if (!isDefined(roleId)) {
        this.logger.warn(
          `Slack Assistant role not found in workspace ${workspaceId}; skipping auto-assign.`,
        );

        return;
      }

      await this.aiAgentRoleService.assignRoleToAgent({
        workspaceId,
        agentId,
        roleId,
      });

      this.logger.log(
        `Auto-assigned the Slack Assistant role to agent ${agentId} in workspace ${workspaceId}.`,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to auto-assign the Slack Assistant role in workspace ${workspaceId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
