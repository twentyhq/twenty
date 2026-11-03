import { Injectable, type OnModuleInit } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { PendingWakeUpOwnerHandlerRegistryService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-owner-handler-registry.service';
import { type PendingWakeUpOutcome } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-outcome.type';
import { type PendingWakeUpOwnerHandler } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-handler.type';
import { type PendingWakeUpOwnerState } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-state.type';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { AgentRunPersonaService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-persona.service';
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
    private readonly agentRunPersonaService: AgentRunPersonaService,
  ) {}

  onModuleInit(): void {
    this.pendingWakeUpOwnerHandlerRegistryService.register('AGENT_RUN', this);
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

  // the run reads what it acts with, so an event never shows it a record its tools could not read
  async getReadPermissions({
    wakeUp: { workspaceId },
    owner: { caller, runSpec },
  }: {
    wakeUp: PendingWakeUpEntity;
    owner: AgentRunSuspension;
  }) {
    const [{ authContext }, persona] = await Promise.all([
      this.callerHandlerRegistry
        .getHandlerOrThrow(caller.type)
        .buildExecutionContext({ workspaceId, caller }),
      this.agentRunPersonaService.resolveOrThrow({
        workspaceId,
        spec: runSpec,
      }),
    ]);
    const runAuthContext =
      await this.agentRunPersonaService.resolveRunAuthContext({
        workspaceId,
        persona,
        authContext,
      });

    return isDefined(runAuthContext) ? { authContext: runAuthContext } : null;
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
