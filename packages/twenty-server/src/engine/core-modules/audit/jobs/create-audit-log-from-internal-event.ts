import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { WorkspaceEventSinkService } from 'src/engine/core-modules/audit/services/workspace-event-sink.service';
import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/audit/types/workspace-event-envelope.type';
import {
  buildObjectEventEnvelope,
  computeEventContextFields,
} from 'src/engine/core-modules/audit/utils/build-event-envelope';
import { OBJECT_RECORD_CREATED_EVENT } from 'src/engine/core-modules/audit/utils/events/object-event/object-record-created';
import { OBJECT_RECORD_DELETED_EVENT } from 'src/engine/core-modules/audit/utils/events/object-event/object-record-delete';
import { OBJECT_RECORD_UPDATED_EVENT } from 'src/engine/core-modules/audit/utils/events/object-event/object-record-updated';
import { OBJECT_RECORD_UPSERTED_EVENT } from 'src/engine/core-modules/audit/utils/events/object-event/object-record-upserted';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

// Turns object-record mutations (the highest-volume event source) into
// objectEvent envelopes and writes them straight to the sinks — it already runs
// in a durable queue worker, so no second hop is needed.
@Processor(MessageQueue.entityEventsToDbQueue)
export class CreateAuditLogFromInternalEvent {
  constructor(
    private readonly workspaceEventSinkService: WorkspaceEventSinkService,
  ) {}

  @Process(CreateAuditLogFromInternalEvent.name)
  async handle(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<void> {
    if (!this.workspaceEventSinkService.isEnabled()) {
      return;
    }

    const envelopes = this.toEnvelopes(workspaceEventBatch);

    if (envelopes.length === 0) {
      return;
    }

    await this.workspaceEventSinkService.write(envelopes);
  }

  private toEnvelopes(
    batch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): WorkspaceEventEnvelope[] {
    const { name } = batch;

    if (name.endsWith('.updated')) {
      return batch.events.map((eventData) =>
        buildObjectEventEnvelope(
          this.contextFields(batch, eventData),
          OBJECT_RECORD_UPDATED_EVENT,
          this.objectProperties(batch, eventData),
        ),
      );
    }

    if (name.endsWith('.created')) {
      return batch.events.map((eventData) =>
        buildObjectEventEnvelope(
          this.contextFields(batch, eventData),
          OBJECT_RECORD_CREATED_EVENT,
          this.objectProperties(batch, eventData),
        ),
      );
    }

    if (name.endsWith('.deleted')) {
      return batch.events.map((eventData) =>
        buildObjectEventEnvelope(
          this.contextFields(batch, eventData),
          OBJECT_RECORD_DELETED_EVENT,
          this.objectProperties(batch, eventData),
        ),
      );
    }

    if (name.endsWith('.upserted')) {
      return batch.events.map((eventData) =>
        buildObjectEventEnvelope(
          this.contextFields(batch, eventData),
          OBJECT_RECORD_UPSERTED_EVENT,
          this.objectProperties(batch, eventData),
        ),
      );
    }

    return [];
  }

  private contextFields(
    batch: WorkspaceEventBatch<ObjectRecordEvent>,
    eventData: ObjectRecordEvent,
  ) {
    return computeEventContextFields({
      workspaceId: batch.workspaceId,
      userId: eventData.userId,
    });
  }

  private objectProperties(
    batch: WorkspaceEventBatch<ObjectRecordEvent>,
    eventData: ObjectRecordEvent,
  ) {
    // Slim the payload: keep diff among the before/after fields.
    const eventProperties =
      'diff' in eventData.properties
        ? { ...eventData.properties, diff: eventData.properties.diff }
        : eventData.properties;

    return {
      ...eventProperties,
      recordId: eventData.recordId,
      objectMetadataId: batch.objectMetadata.id,
    };
  }
}
