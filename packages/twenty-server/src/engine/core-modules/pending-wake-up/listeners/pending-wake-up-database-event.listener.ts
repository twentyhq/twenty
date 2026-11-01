import { Injectable } from '@nestjs/common';

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { buildPendingWakeUpEvent } from 'src/engine/core-modules/pending-wake-up/utils/build-pending-wake-up-event.util';
import { doesEventMatchPendingWakeUp } from 'src/engine/core-modules/pending-wake-up/utils/does-event-match-pending-wake-up.util';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

@Injectable()
export class PendingWakeUpDatabaseEventListener {
  constructor(private readonly pendingWakeUpService: PendingWakeUpService) {}

  @OnDatabaseBatchEvent('*', DatabaseEventAction.CREATED)
  async handleObjectRecordCreateEvent(
    payload: WorkspaceEventBatch<ObjectRecordEvent>,
  ) {
    await this.resumeMatchingWakeUps(payload);
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.UPDATED)
  async handleObjectRecordUpdateEvent(
    payload: WorkspaceEventBatch<ObjectRecordEvent>,
  ) {
    await this.resumeMatchingWakeUps(payload);
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.DELETED)
  async handleObjectRecordDeleteEvent(
    payload: WorkspaceEventBatch<ObjectRecordEvent>,
  ) {
    await this.resumeMatchingWakeUps(payload);
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.UPSERTED)
  async handleObjectRecordUpsertEvent(
    payload: WorkspaceEventBatch<ObjectRecordEvent>,
  ) {
    await this.resumeMatchingWakeUps(payload);
  }

  private async resumeMatchingWakeUps(
    payload: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<void> {
    const { workspaceId, name: eventName } = payload;

    if (!isNonEmptyString(workspaceId) || !isNonEmptyString(eventName)) {
      return;
    }

    const eventWakeUps = await this.pendingWakeUpService.findEventWakeUps({
      workspaceId,
      eventName,
    });

    if (eventWakeUps.length === 0) {
      return;
    }

    const now = Date.now();

    for (const eventWakeUp of eventWakeUps) {
      // an expired wake-up resolves as a timeout through its own job
      if (
        isDefined(eventWakeUp.resumeAt) &&
        eventWakeUp.resumeAt.getTime() <= now
      ) {
        continue;
      }

      // the resolution skips a record the waiting run cannot read, so every match gets one
      const matchingEvents = payload.events.filter((event) =>
        doesEventMatchPendingWakeUp({
          condition: eventWakeUp.condition,
          event,
        }),
      );

      for (const matchingEvent of matchingEvents) {
        await this.pendingWakeUpService.scheduleResolution({
          wakeUp: eventWakeUp,
          event: buildPendingWakeUpEvent({ eventName, event: matchingEvent }),
        });
      }
    }
  }
}
