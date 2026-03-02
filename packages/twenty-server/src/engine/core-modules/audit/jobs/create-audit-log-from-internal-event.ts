import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { OBJECT_RECORD_CREATED_EVENT } from 'src/engine/core-modules/audit/utils/events/object-event/object-record-created';
import { OBJECT_RECORD_DELETED_EVENT } from 'src/engine/core-modules/audit/utils/events/object-event/object-record-delete';
import { OBJECT_RECORD_UPDATED_EVENT } from 'src/engine/core-modules/audit/utils/events/object-event/object-record-updated';
import { OBJECT_RECORD_UPSERTED_EVENT } from 'src/engine/core-modules/audit/utils/events/object-event/object-record-upserted';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

@Processor(MessageQueue.entityEventsToDbQueue)
export class CreateAuditLogFromInternalEvent {
  constructor(private readonly auditService: AuditService) {}

  @Process(CreateAuditLogFromInternalEvent.name)
  async handle(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<void> {
    for (const eventData of workspaceEventBatch.events) {
      // We remove "before" and "after" property for a cleaner/slimmer event payload
      const eventProperties =
        'diff' in eventData.properties
          ? {
              ...eventData.properties,
              diff: eventData.properties.diff,
            }
          : eventData.properties;

      const auditService = this.auditService.createContext({
        workspaceId: workspaceEventBatch.workspaceId,
        userId: eventData.userId,
      });

      // Since these are object record events, we use createObjectEvent
      if (workspaceEventBatch.name.endsWith('.updated')) {
        auditService.createObjectEvent(OBJECT_RECORD_UPDATED_EVENT, {
          ...eventProperties,
          recordId: eventData.recordId,
          objectMetadataId: workspaceEventBatch.objectMetadata.id,
        });
      } else if (workspaceEventBatch.name.endsWith('.created')) {
        auditService.createObjectEvent(OBJECT_RECORD_CREATED_EVENT, {
          ...eventProperties,
          recordId: eventData.recordId,
          objectMetadataId: workspaceEventBatch.objectMetadata.id,
        });
      } else if (workspaceEventBatch.name.endsWith('.deleted')) {
        auditService.createObjectEvent(OBJECT_RECORD_DELETED_EVENT, {
          ...eventProperties,
          recordId: eventData.recordId,
          objectMetadataId: workspaceEventBatch.objectMetadata.id,
        });
      } else if (workspaceEventBatch.name.endsWith('.upserted')) {
        auditService.createObjectEvent(OBJECT_RECORD_UPSERTED_EVENT, {
          ...eventProperties,
          recordId: eventData.recordId,
          objectMetadataId: workspaceEventBatch.objectMetadata.id,
        });
      }
    }
  }
}
