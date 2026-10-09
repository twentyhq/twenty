import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';

import { type AgentTrigger } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { z } from 'zod';

import { buildCreatedByFromAgent } from 'src/engine/core-modules/actor/utils/build-created-by-from-agent.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { type AgentRunCallerInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-input.type';
import { type AgentRunCallerHandler } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-handler.type';
import { type OwnerWaitingState } from 'src/engine/core-modules/pending-wake-up/types/owner-waiting-state.type';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { buildAgentRolePermissionConfig } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-role-permission-config.util';
import { AGENT_TRIGGER_BASE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent-trigger/constants/agent-trigger-base-system-prompt.const';
import { type RunAgentTriggerJobData } from 'src/engine/metadata-modules/ai/ai-agent-trigger/types/run-agent-trigger-job-data.type';
import { buildAgentTriggerMessages } from 'src/engine/metadata-modules/ai/ai-agent-trigger/utils/build-agent-trigger-messages.util';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const agentTriggerCallerRefSchema = z.object({
  agentId: z.string(),
  triggerId: z.string(),
  dispatchedRoleId: z.string().optional(),
});

type AgentTriggerCallerRef = z.infer<typeof agentTriggerCallerRefSchema>;

type TriggeredRun = {
  agent: AgentEntity;
  trigger: AgentTrigger;
  executionContext: AgentRunExecutionContext;
};

// Runs an agent on its triggers. A run that waits goes on later with the trigger as its caller,
// as long as the trigger could still start it
@Injectable()
export class AgentTriggerRunnerService
  implements AgentRunCallerHandler, OnModuleInit
{
  private readonly logger = new Logger(AgentTriggerRunnerService.name);

  constructor(
    private readonly agentRunnerService: AgentRunnerService,
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
    private readonly agentActorContextService: AgentActorContextService,
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
  ) {}

  onModuleInit(): void {
    this.callerHandlerRegistry.register('AGENT_TRIGGER', this);
  }

  async run({
    workspaceId,
    payload,
    ...ref
  }: RunAgentTriggerJobData): Promise<void> {
    const triggeredRun = await this.findTriggeredRun({ workspaceId, ref });

    if (!isDefined(triggeredRun)) {
      return;
    }

    const { agent, trigger, executionContext } = triggeredRun;

    await this.agentRunnerService.run({
      workspaceId,
      conversation: {
        threadId: v4(),
        isCreated: true,
      },
      caller: { type: 'AGENT_TRIGGER', ref },
      spec: {
        agentId: agent.id,
        title: agent.label,
        baseSystemPrompt: AGENT_TRIGGER_BASE_SYSTEM_PROMPT,
        instructions: null,
        // nobody is there to answer, so the run can wait but not ask
        capabilities: {
          canAskHumans: false,
        },
        toolLoadingStrategy: 'lazy',
      },
      agent,
      prompt: {
        messages: buildAgentTriggerMessages({
          instructions: trigger.instructions,
          payload,
        }),
        senderUserWorkspaceId: null,
        senderApplicationId: agent.applicationId,
      },
      executionContext,
    });
  }

  async buildExecutionContext({
    workspaceId,
    caller,
  }: AgentRunCallerInput): Promise<AgentRunExecutionContext> {
    const ref = agentTriggerCallerRefSchema.parse(caller.ref);
    const triggeredRun = await this.findTriggeredRun({ workspaceId, ref });

    if (!isDefined(triggeredRun)) {
      throw new AiException(
        `Trigger ${ref.triggerId} of agent ${ref.agentId} can no longer run`,
        AiExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    return triggeredRun.executionContext;
  }

  async getWaitingState({
    workspaceId,
    caller,
  }: AgentRunCallerInput): Promise<OwnerWaitingState> {
    const ref = agentTriggerCallerRefSchema.parse(caller.ref);

    return isDefined(await this.findTriggeredRun({ workspaceId, ref }))
      ? 'WAITING'
      : 'GONE';
  }

  // The trigger may have been turned off or removed, or the agent's role changed, since the run was queued
  private async findTriggeredRun({
    workspaceId,
    ref: { agentId, triggerId, dispatchedRoleId },
  }: {
    workspaceId: string;
    ref: AgentTriggerCallerRef;
  }): Promise<TriggeredRun | null> {
    const agent = await this.agentRepository.findOne(workspaceId, {
      where: { id: agentId },
    });

    const trigger = agent?.triggers.find(
      (agentTrigger) => agentTrigger.id === triggerId,
    );

    if (!isDefined(agent) || !isDefined(trigger) || !trigger.isActive) {
      return null;
    }

    const agentContext =
      await this.agentActorContextService.buildApplicationAgentContext({
        workspaceId,
        agent,
      });

    if (!isDefined(agentContext)) {
      this.logger.warn(
        `Skipping trigger ${triggerId} of agent ${agentId}: application ${agent.applicationId} not found`,
      );

      return null;
    }

    const { application, authContext, agentRoleId } = agentContext;

    if (isDefined(dispatchedRoleId) && agentRoleId !== dispatchedRoleId) {
      this.logger.warn(
        `Skipping trigger ${triggerId} of agent ${agentId}: its role changed since the run was queued`,
      );

      return null;
    }

    const actingAgent = { id: agent.id, label: agent.label };
    const createdBy = buildCreatedByFromAgent({
      agent: actingAgent,
      applicationId: application.id,
    });

    return {
      agent,
      trigger,
      executionContext: {
        authContext: { ...authContext, actingAgent },
        actorContext: createdBy,
        turnCreatedBy: createdBy,
        userWorkspaceId: null,
        rolePermissionConfig: buildAgentRolePermissionConfig({ agentRoleId }),
        usageOperationType: UsageOperationType.AI_WORKFLOW_TOKEN,
      },
    };
  }
}
