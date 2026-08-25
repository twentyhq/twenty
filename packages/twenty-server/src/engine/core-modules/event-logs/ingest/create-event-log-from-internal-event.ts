import { Logger } from '@nestjs/common';

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { isTransientClickHouseNetworkError } from 'src/database/clickhouse/utils/is-transient-clickhouse-network-error.util';
import { WorkspaceEventSinkService } from 'src/engine/core-modules/event-logs/ingest/workspace-event-sink.service';
import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';
import {
  buildObjectEventEnvelope,
  computeEventContextFields,
} from 'src/engine/core-modules/event-logs/emit/build-event-envelope';
import { OBJECT_RECORD_CREATED_EVENT } from 'src/engine/core-modules/event-logs/emit/events/object-event/object-record-created';
import { OBJECT_RECORD_DELETED_EVENT } from 'src/engine/core-modules/event-logs/emit/events/object-event/object-record-delete';
import { OBJECT_RECORD_UPDATED_EVENT } from 'src/engine/core-modules/event-logs/emit/events/object-event/object-record-updated';
import { OBJECT_RECORD_UPSERTED_EVENT } from 'src/engine/core-modules/event-logs/emit/events/object-event/object-record-upserted';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

const MAX_TRANSIENT_ERROR_RETRIES = 1;

export type CreateEventLogFromInternalEventData =
  WorkspaceEventBatch<ObjectRecordEvent> & {
    transientErrorRetryCount?: number;
  };

const OBJECT_EVENT_BY_SUFFIX = {
  '.created': OBJECT_RECORD_CREATED_EVENT,
  '.updated': OBJECT_RECORD_UPDATED_EVENT,
  '.deleted': OBJECT_RECORD_DELETED_EVENT,
  '.upserted': OBJECT_RECORD_UPSERTED_EVENT,
} as const;

@Processor(MessageQueue.entityEventsToDbQueue)
export class CreateEventLogFromInternalEvent {
  private readonly logger = new Logger(CreateEventLogFromInternalEvent.name);

  constructor(
    private readonly workspaceEventSinkService: WorkspaceEventSinkService,
    @InjectMessageQueue(MessageQueue.entityEventsToDbQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Process(CreateEventLogFromInternalEvent.name)
  async handle(batch: CreateEventLogFromInternalEventData): Promise<void> {
    if (!this.workspaceEventSinkService.isEnabled()) {
      return;
    }

    const envelopes = this.toEnvelopes(batch);

    if (envelopes.length === 0) {
      return;
    }

    try {
      await this.workspaceEventSinkService.ingest(envelopes);
    } catch (error) {
      if (!isTransientClickHouseNetworkError(error)) {
        throw error;
      }

      await this.handleTransientError(batch, envelopes.length, error);
    }
  }

  private async handleTransientError(
    batch: CreateEventLogFromInternalEventData,
    envelopeCount: number,
    error: Error,
  ): Promise<void> {
    const transientErrorRetryCount = batch.transientErrorRetryCount ?? 0;

    if (transientErrorRetryCount >= MAX_TRANSIENT_ERROR_RETRIES) {
      this.logger.warn(
        `Dropping ${envelopeCount} event log envelope(s) for workspace ${batch.workspaceId} after ${transientErrorRetryCount + 1} transient ClickHouse network errors: ${error.message}`,
      );

      return;
    }

    this.logger.warn(
      `Requeuing ${envelopeCount} event log envelope(s) for workspace ${batch.workspaceId} after a transient ClickHouse network error: ${error.message}`,
    );

    await this.messageQueueService.add<CreateEventLogFromInternalEventData>(
      CreateEventLogFromInternalEvent.name,
      { ...batch, transientErrorRetryCount: transientErrorRetryCount + 1 },
    );
  }

  private toEnvelopes(
    batch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): WorkspaceEventEnvelope[] {
    const suffix = (
      Object.keys(
        OBJECT_EVENT_BY_SUFFIX,
      ) as (keyof typeof OBJECT_EVENT_BY_SUFFIX)[]
    ).find((candidate) => batch.name.endsWith(candidate));

    if (!isDefined(suffix)) {
      return [];
    }

    const event = OBJECT_EVENT_BY_SUFFIX[suffix];

    return batch.events.map((eventData) =>
      buildObjectEventEnvelope(
        computeEventContextFields({
          workspaceId: batch.workspaceId,
          userId: eventData.userId,
        }),
        event,
        this.objectProperties(batch, eventData),
      ),
    );
  }

  private objectProperties(
    batch: WorkspaceEventBatch<ObjectRecordEvent>,
    eventData: ObjectRecordEvent,
  ) {
    return {
      ...eventData.properties,
      recordId: eventData.recordId,
      objectMetadataId: batch.objectMetadata.id,
    };
  }
}
