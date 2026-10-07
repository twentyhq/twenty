import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { buildCreatedByFromAgent } from 'src/engine/core-modules/actor/utils/build-created-by-from-agent.util';
import { buildApplicationAuthContext } from 'src/engine/core-modules/auth/utils/build-application-auth-context.util';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { buildAgentRunThreadId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-thread-id.util';
import { AGENT_TRIGGER_BASE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent-trigger/constants/agent-trigger-base-system-prompt.const';
import { type RunAgentTriggerJobData } from 'src/engine/metadata-modules/ai/ai-agent-trigger/types/run-agent-trigger-job-data.type';
import { buildAgentTriggerMessages } from 'src/engine/metadata-modules/ai/ai-agent-trigger/utils/build-agent-trigger-messages.util';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AgentTriggerRunnerService {
  private readonly logger = new Logger(AgentTriggerRunnerService.name);

  constructor(
    private readonly agentRunnerService: AgentRunnerService,
    private readonly applicationLookupService: ApplicationLookupService,
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async run({
    workspaceId,
    agentId,
    triggerId,
    dispatchedRoleId,
    payload,
  }: RunAgentTriggerJobData): Promise<void> {
    const agent = await this.agentRepository.findOne(workspaceId, {
      where: { id: agentId },
    });

    const trigger = agent?.triggers.find(
      (agentTrigger) => agentTrigger.id === triggerId,
    );

    // The trigger may have been turned off or removed while the run was queued
    if (!isDefined(agent) || !isDefined(trigger) || !trigger.isActive) {
      return;
    }

    if (isDefined(dispatchedRoleId)) {
      const { flatRoleTargetByAgentIdMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatRoleTargetByAgentIdMaps',
        ]);

      if (flatRoleTargetByAgentIdMaps[agentId]?.roleId !== dispatchedRoleId) {
        this.logger.warn(
          `Skipping trigger ${triggerId} of agent ${agentId}: its role changed since the run was queued`,
        );

        return;
      }
    }

    const [workspace, application] = await Promise.all([
      this.workspaceRepository.findOneOrFail({ where: { id: workspaceId } }),
      this.applicationLookupService.findById({
        id: agent.applicationId,
        workspaceId,
      }),
    ]);

    if (!isDefined(application)) {
      this.logger.warn(
        `Skipping trigger ${triggerId} of agent ${agentId}: application ${agent.applicationId} not found`,
      );

      return;
    }

    const actingAgent = { id: agent.id, label: agent.label };
    const authContext = {
      ...buildApplicationAuthContext({
        workspace: fromWorkspaceEntityToFlat(workspace),
        application,
      }),
      actingAgent,
    };
    const messages = buildAgentTriggerMessages({
      instructions: trigger.instructions,
      payload,
    });
    const createdBy = buildCreatedByFromAgent({
      agent: actingAgent,
      applicationId: application.id,
    });

    await this.agentRunnerService.run({
      workspaceId,
      conversation: {
        threadId: buildAgentRunThreadId({
          applicationId: application.id,
          agentId: agent.id,
          threadKey: `trigger:${trigger.id}:${v4()}`,
        }),
        isCreated: true,
      },
      turn: {
        title: agent.label,
        senderUserWorkspaceId: null,
        senderApplicationId: application.id,
        messages,
        resolveCreatedBy: async () => createdBy,
      },
      execution: {
        agent,
        messages,
        baseSystemPrompt: AGENT_TRIGGER_BASE_SYSTEM_PROMPT,
        actorContext: createdBy,
        authContext,
        workspaceId,
        userWorkspaceId: null,
        toolLoadingStrategy: 'lazy',
      },
    });
  }
}
