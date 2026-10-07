import { Injectable, Logger } from '@nestjs/common';

import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { PendingWakeUpOwnerHandlerRegistryService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-owner-handler-registry.service';
import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { type PendingWakeUpEvent } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-event.type';
import { type PendingWakeUpOwnerHandler } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-handler.type';
import { type ResumePendingWakeUpJobData } from 'src/engine/core-modules/pending-wake-up/types/resume-pending-wake-up-job-data.type';
import { buildPendingWakeUpOutcome } from 'src/engine/core-modules/pending-wake-up/utils/build-pending-wake-up-outcome.util';
import { restrictPendingWakeUpEventToReadableRecord } from 'src/engine/core-modules/pending-wake-up/utils/restrict-pending-wake-up-event-to-readable-record.util';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';

const RECORD_READ_MAX_ATTEMPTS = 8;

const RETRY_BASE_DELAY_MS = 2_000;
const RETRY_MAX_DELAY_MS = 60_000;

const computeRetryDelayMs = (attempt: number): number =>
  Math.min(RETRY_BASE_DELAY_MS * 2 ** attempt, RETRY_MAX_DELAY_MS);

@Injectable()
export class PendingWakeUpResolverService {
  private readonly logger = new Logger(PendingWakeUpResolverService.name);

  constructor(
    private readonly pendingWakeUpService: PendingWakeUpService,
    private readonly pendingWakeUpOwnerHandlerRegistryService: PendingWakeUpOwnerHandlerRegistryService,
    private readonly findRecordsService: FindRecordsService,
  ) {}

  async resolve({
    workspaceId,
    wakeUpId,
    event,
    answer,
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
    const ownerState = await handler.getOwnerState(wakeUp);

    if (ownerState.status === 'NOT_READY') {
      await this.pendingWakeUpService.scheduleResolution({
        wakeUp,
        event,
        answer,
        attempt: attempt + 1,
        delayMs: computeRetryDelayMs(attempt),
      });

      return;
    }

    const shouldReadEventRecord =
      ownerState.status === 'WAITING' && isDefined(event);

    const readableEvent = shouldReadEventRecord
      ? await this.readEventRecord({
          wakeUp,
          event,
          recordReadAttempt,
          readPermissions: await handler.getReadPermissions({
            wakeUp,
            owner: ownerState.owner,
          }),
        })
      : event;

    // an event whose record the owner cannot read yet keeps it waiting
    if (shouldReadEventRecord && !isDefined(readableEvent)) {
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
        event: readableEvent,
        answer,
      }),
      owner: ownerState.owner,
      isOwnerGone: ownerState.status === 'GONE',
    });
  }

  // The event's record is read with its owner's permissions: a record the owner cannot read must not
  // wake it up, so the wait goes on for another event. A failed read cannot tell a transient
  // error from an object the owner cannot read, so it is retried a few times
  private async readEventRecord({
    wakeUp,
    event,
    recordReadAttempt,
    readPermissions,
  }: {
    wakeUp: PendingWakeUpEntity;
    event: PendingWakeUpEvent;
    recordReadAttempt: number;
    readPermissions: Awaited<
      ReturnType<PendingWakeUpOwnerHandler['getReadPermissions']>
    >;
  }): Promise<PendingWakeUpEvent | undefined> {
    const [objectName, action] = event.eventName.split('.');

    const { success, result, error } = await this.findRecordsService.execute({
      objectName,
      // a deleted record only reads when the filter asks for deleted records
      filter:
        action === 'deleted'
          ? { id: { eq: event.recordId }, deletedAt: { is: 'NOT_NULL' } }
          : { id: { eq: event.recordId } },
      limit: 1,
      ...readPermissions,
      shouldBuildEffectiveSelectFields: false,
    });

    if (!success) {
      if (recordReadAttempt < RECORD_READ_MAX_ATTEMPTS) {
        await this.pendingWakeUpService.scheduleResolution({
          wakeUp,
          event,
          recordReadAttempt: recordReadAttempt + 1,
          delayMs: computeRetryDelayMs(recordReadAttempt),
        });
      } else {
        this.logger.warn(
          `Wait ${wakeUp.id} of ${wakeUp.ownerType} owner ${wakeUp.ownerId} kept waiting after its ${event.eventName} record could not be read: ${error}`,
        );
      }

      return undefined;
    }

    const record = result?.records[0];

    return isPlainObject(record)
      ? restrictPendingWakeUpEventToReadableRecord({
          event,
          readableRecord: record,
        })
      : undefined;
  }
}
