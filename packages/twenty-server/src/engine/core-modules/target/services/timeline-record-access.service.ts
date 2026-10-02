import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { canReadTimelineObjects } from 'src/engine/core-modules/target/utils/can-read-timeline-objects.util';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { resolveObjectRecordsPermissions } from 'src/engine/twenty-orm/utils/resolve-object-records-permissions.util';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

@Injectable()
export class TimelineRecordAccessService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  async canReadRecordTimeline({
    objectNameSingular,
    recordId,
    timelineObjectNamesSingular,
  }: {
    objectNameSingular: string;
    recordId: string;
    timelineObjectNamesSingular: string[];
  }): Promise<boolean> {
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceContext = getWorkspaceContext();
      const rolePermissionConfig = resolveRolePermissionConfig({
        authContext: workspaceContext.authContext,
        userWorkspaceRoleMap: workspaceContext.userWorkspaceRoleMap,
        apiKeyRoleMap: workspaceContext.apiKeyRoleMap,
      });

      if (
        !isDefined(rolePermissionConfig) ||
        !isDefined(workspaceContext.objectIdByNameSingular[objectNameSingular])
      ) {
        return false;
      }

      const { objectRecordsPermissions, shouldBypassPermissionChecks } =
        resolveObjectRecordsPermissions({
          rolePermissionConfig,
          objectPermissionsByRoleId: workspaceContext.permissionsPerRoleId,
        });

      if (
        !shouldBypassPermissionChecks &&
        !canReadTimelineObjects({
          timelineObjectNamesSingular,
          objectIdByNameSingular: workspaceContext.objectIdByNameSingular,
          objectRecordsPermissions,
        })
      ) {
        return false;
      }

      // Trashed records keep their timeline, so only row-level permissions and record shares narrow access here
      const readableRecordIds = await this.workspaceOrmManager
        .getRepository(objectNameSingular, rolePermissionConfig)
        .findRecordIdsAllowedForOperation({
          recordIds: [recordId],
          operationType: 'select',
          withDeleted: true,
        });

      return readableRecordIds.includes(recordId);
    });
  }
}
