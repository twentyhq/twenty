import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { OBJECT_RECORD_CREATED_EVENT } from 'src/engine/core-modules/audit/utils/events/track/object-record/object-record-created';
import { OBJECT_RECORD_DELETED_EVENT } from 'src/engine/core-modules/audit/utils/events/track/object-record/object-record-delete';
import { OBJECT_RECORD_UPDATED_EVENT } from 'src/engine/core-modules/audit/utils/events/track/object-record/object-record-updated';
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

      if (workspaceEventBatch.name.endsWith('.updated')) {
        analytics.track(OBJECT_RECORD_UPDATED_EVENT, eventProperties);
      } else if (workspaceEventBatch.name.endsWith('.created')) {
        analytics.track(OBJECT_RECORD_CREATED_EVENT, eventProperties);
      } else if (workspaceEventBatch.name.endsWith('.deleted')) {
        analytics.track(OBJECT_RECORD_DELETED_EVENT, eventProperties);
      }
    }
  }
}
