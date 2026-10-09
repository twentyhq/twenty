import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
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
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class GlobalWorkspaceMemberListener {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly userWorkspaceService: UserWorkspaceService,
  ) {}

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

  // The request locale is read from userWorkspace.locale
  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.UPDATED)
  async syncUserWorkspaceLocale(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<WorkspaceMemberWorkspaceEntity>
    >,
  ) {
    for (const event of payload.events) {
      const { after } = event.properties;

      if (!isDefined(event.properties.diff?.locale) || !isDefined(after)) {
        continue;
      }

      const userWorkspace =
        await this.userWorkspaceService.getUserWorkspaceForUser({
          userId: after.userId,
          workspaceId: payload.workspaceId,
          relations: [],
        });

      if (!isDefined(userWorkspace) || userWorkspace.locale === after.locale) {
        continue;
      }

      await this.userWorkspaceService.updateUserWorkspaceLocaleForUserWorkspace(
        {
          locale: after.locale as UserWorkspaceEntity['locale'],
          userWorkspaceId: userWorkspace.id,
        },
      );
    }
  }
}
