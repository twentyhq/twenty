import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { PendingWakeUpOwnerHandlerRegistryService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-owner-handler-registry.service';
import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { type ResumePendingWakeUpJobData } from 'src/engine/core-modules/pending-wake-up/types/resume-pending-wake-up-job-data.type';
import { buildPendingWakeUpOutcome } from 'src/engine/core-modules/pending-wake-up/utils/build-pending-wake-up-outcome.util';

@Injectable()
export class PendingWakeUpResolverService {
  constructor(
    private readonly pendingWakeUpService: PendingWakeUpService,
    private readonly pendingWakeUpOwnerHandlerRegistryService: PendingWakeUpOwnerHandlerRegistryService,
  ) {}

  async resolve({
    workspaceId,
    wakeUpId,
    event,
    attempt = 0,
    recordReadAttempt = 0,
  }: ResumePendingWakeUpJobData): Promise<void> {
    const wakeUp = await this.pendingWakeUpService.find({
      workspaceId,
      wakeUpId,
    });

    if (!isDefined(wakeUp)) {
      return;
    }

    const handler =
      this.pendingWakeUpOwnerHandlerRegistryService.getHandlerOrThrow(
        wakeUp.ownerType,
      );

    const decision = await handler.beforeClaim({
      wakeUp,
      event,
      attempt,
      recordReadAttempt,
    });

    if (decision.type === 'IGNORE') {
      return;
    }

    if (decision.type === 'RETRY_LATER') {
      await this.pendingWakeUpService.scheduleResolution({
        wakeUp,
        event,
        attempt: decision.attempt,
        recordReadAttempt: decision.recordReadAttempt,
        delayMs: decision.delayMs,
      });

      return;
    }

    const claimedWakeUp = await this.pendingWakeUpService.claim({
      workspaceId,
      wakeUpId,
    });

    if (!isDefined(claimedWakeUp)) {
      return;
    }

    await handler.resolve({
      claimedWakeUp,
      outcome: buildPendingWakeUpOutcome({
        condition: claimedWakeUp.condition,
        event: decision.event ?? event,
      }),
      context: decision.context,
    });
  }
}
