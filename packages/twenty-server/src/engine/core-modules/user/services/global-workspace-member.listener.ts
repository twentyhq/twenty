import { Injectable } from '@nestjs/common';

import {
  ObjectRecordCreateEvent,
  ObjectRecordRestoreEvent,
  ObjectRecordUpdateEvent,
  ObjectRecordUpsertEvent,
  type ObjectRecordDeleteEvent,
  type ObjectRecordDestroyEvent,
} from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class GlobalWorkspaceMemberListener {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.CREATED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.UPDATED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.DELETED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.DESTROYED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.RESTORED)
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.UPSERTED)
  async handleWorkspaceMemberEvent(
    payload: WorkspaceEventBatch<
      | ObjectRecordCreateEvent<WorkspaceMemberWorkspaceEntity>
      | ObjectRecordUpdateEvent<WorkspaceMemberWorkspaceEntity>
      | ObjectRecordDeleteEvent<WorkspaceMemberWorkspaceEntity>
      | ObjectRecordDestroyEvent<WorkspaceMemberWorkspaceEntity>
      | ObjectRecordRestoreEvent<WorkspaceMemberWorkspaceEntity>
      | ObjectRecordUpsertEvent<WorkspaceMemberWorkspaceEntity>
    >,
  ) {
    await this.workspaceCacheService.invalidateAndRecompute(
      payload.workspaceId,
      ['flatWorkspaceMemberMaps'],
    );
  }
}
