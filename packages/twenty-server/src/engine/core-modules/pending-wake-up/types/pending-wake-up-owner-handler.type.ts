import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { type PendingWakeUpEvent } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-event.type';
import { type PendingWakeUpOutcome } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-outcome.type';

export type PendingWakeUpBeforeClaimDecision<TResolveContext> =
  // the event, when given, replaces the one that woke the owner up
  | { type: 'RESOLVE'; event?: PendingWakeUpEvent; context: TResolveContext }
  | {
      type: 'RETRY_LATER';
      delayMs: number;
      attempt?: number;
      recordReadAttempt?: number;
    }
  // the wake-up stays pending for a later event or its own time
  | { type: 'IGNORE' };

export type PendingWakeUpOwnerHandler<TResolveContext = unknown> = {
  buildResumeJobOptions(ownerId: string): QueueJobOptions;

  beforeClaim(input: {
    wakeUp: PendingWakeUpEntity;
    event?: PendingWakeUpEvent;
    attempt: number;
    recordReadAttempt: number;
  }): Promise<PendingWakeUpBeforeClaimDecision<TResolveContext>>;

  resolve(input: {
    claimedWakeUp: PendingWakeUpEntity;
    outcome: PendingWakeUpOutcome;
    context: TResolveContext;
  }): Promise<void>;
};
