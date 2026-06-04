import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

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

const OBJECT_EVENT_BY_SUFFIX = {
  '.created': OBJECT_RECORD_CREATED_EVENT,
  '.updated': OBJECT_RECORD_UPDATED_EVENT,
  '.deleted': OBJECT_RECORD_DELETED_EVENT,
  '.upserted': OBJECT_RECORD_UPSERTED_EVENT,
} as const;

// Turns object-record mutations (the highest-volume event source) into
// objectEvent envelopes and ingests them straight from this worker — it is
// already durable, so it doesn't re-enqueue onto the unified queue.
@Processor(MessageQueue.entityEventsToDbQueue)
export class CreateAuditLogFromInternalEvent {
  constructor(
    private readonly workspaceEventSinkService: WorkspaceEventSinkService,
  ) {}

  @Process(CreateAuditLogFromInternalEvent.name)
  async handle(batch: WorkspaceEventBatch<ObjectRecordEvent>): Promise<void> {
    if (!this.workspaceEventSinkService.isEnabled()) {
      return;
    }

    const envelopes = this.toEnvelopes(batch);

    if (envelopes.length === 0) {
      return;
    }

    await this.workspaceEventSinkService.ingest(envelopes);
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
    // Drop the (large) before/after snapshots; the diff and remaining fields
    // are what the audit log keeps. Actions without them are unaffected.
    const {
      before: _before,
      after: _after,
      ...slimProperties
    } = eventData.properties as Record<string, unknown>;

    return {
      ...slimProperties,
      recordId: eventData.recordId,
      objectMetadataId: batch.objectMetadata.id,
    };
  }
}
