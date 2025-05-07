import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { OBJECT_RECORD_CREATED_EVENT } from 'src/engine/core-modules/audit/utils/events/object-event/object-record-created';
import { OBJECT_RECORD_DELETED_EVENT } from 'src/engine/core-modules/audit/utils/events/object-event/object-record-delete';
import { OBJECT_RECORD_UPDATED_EVENT } from 'src/engine/core-modules/audit/utils/events/object-event/object-record-updated';
import { ObjectRecordEvent } from 'src/engine/core-modules/event-emitter/types/object-record-event.event';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Processor(MessageQueue.entityEventsToDbQueue)
export class CreateAuditLogFromInternalEvent {
  constructor(
    @InjectObjectMetadataRepository(WorkspaceMemberWorkspaceEntity)
    private readonly workspaceMemberService: WorkspaceMemberRepository,
    private readonly auditService: AuditService,
  ) {}

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

      const analytics = this.auditService.createContext({
        workspaceId: workspaceEventBatch.workspaceId,
        userId: eventData.userId,
      });

      // Since these are object record events, we use insertObjectEvent
      if (workspaceEventBatch.name.endsWith('.updated')) {
        analytics.insertObjectEvent(OBJECT_RECORD_UPDATED_EVENT, {
          ...eventProperties,
          recordId: eventData.recordId,
          objectMetadataId: eventData.objectMetadata.id,
        });
      } else if (workspaceEventBatch.name.endsWith('.created')) {
        analytics.insertObjectEvent(OBJECT_RECORD_CREATED_EVENT, {
          ...eventProperties,
          recordId: eventData.recordId,
          objectMetadataId: eventData.objectMetadata.id,
        });
      } else if (workspaceEventBatch.name.endsWith('.deleted')) {
        analytics.insertObjectEvent(OBJECT_RECORD_DELETED_EVENT, {
          ...eventProperties,
          recordId: eventData.recordId,
          objectMetadataId: eventData.objectMetadata.id,
        });
      }
    }
  }
}
