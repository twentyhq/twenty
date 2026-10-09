import { Injectable, type OnModuleInit } from '@nestjs/common';

import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { PendingWakeUpOwnerHandlerRegistryService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-owner-handler-registry.service';
import { type PendingWakeUpOutcome } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-outcome.type';
import { type PendingWakeUpOwnerHandler } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-handler.type';
import { type PendingWakeUpOwnerState } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-state.type';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { type AgentRunSuspension } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-suspension.type';

// An AGENT_RUN wake-up is owned by the conversation of a suspended run, and its payload is the run
@Injectable()
export class AgentRunPendingWakeUpHandlerService
  implements PendingWakeUpOwnerHandler<AgentRunSuspension>, OnModuleInit
{
  constructor(
    private readonly pendingWakeUpOwnerHandlerRegistryService: PendingWakeUpOwnerHandlerRegistryService,
    private readonly agentRunSuspensionService: AgentRunSuspensionService,
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
  ) {}

  onModuleInit(): void {
    this.pendingWakeUpOwnerHandlerRegistryService.register('AGENT_RUN', this);
  }

  buildResumeJobOptions(): QueueJobOptions {
    return {};
  }

  async getOwnerState({
    workspaceId,
    payload,
  }: PendingWakeUpEntity): Promise<
    PendingWakeUpOwnerState<AgentRunSuspension>
  > {
    const suspension = payload as AgentRunSuspension;
    const status = await this.callerHandlerRegistry
      .getHandlerOrThrow(suspension.caller.type)
      .getWaitingState({ workspaceId, caller: suspension.caller });

    return status === 'NOT_READY' ? { status } : { status, owner: suspension };
  }

  // the run reads what its caller lets it read
  async getReadPermissions({
    wakeUp: { workspaceId },
    owner: { caller },
  }: {
    wakeUp: PendingWakeUpEntity;
    owner: AgentRunSuspension;
  }) {
    return this.callerHandlerRegistry
      .getHandlerOrThrow(caller.type)
      .buildExecutionContext({ workspaceId, caller });
  }

  // the run removes its wake-up once it went on, so the conversation waits until then
  async resolve({
    wakeUp,
    outcome,
    isOwnerGone,
  }: {
    wakeUp: PendingWakeUpEntity;
    outcome: PendingWakeUpOutcome;
    isOwnerGone: boolean;
  }): Promise<void> {
    if (isOwnerGone) {
      await this.agentRunSuspensionService.release({
        workspaceId: wakeUp.workspaceId,
        wakeUp,
      });

      return;
    }

    await this.agentRunSuspensionService.scheduleContinuation({
      workspaceId: wakeUp.workspaceId,
      threadId: wakeUp.ownerId,
      wakeUpId: wakeUp.id,
      outcome,
    });
  }
}
