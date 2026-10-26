import { isDefined } from 'twenty-shared/utils';
import { type ObjectRecord } from 'twenty-shared/types';
import { type ObjectLiteral } from 'typeorm';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

export const getRecordPermissionReadRepository = <
  TRecord extends ObjectLiteral = ObjectRecord,
>(
  workspaceOrmManager: WorkspaceOrmManager,
  objectNameSingular: string,
) =>
  isDefined(getWorkspaceContext().recordPermissionContext)
    ? workspaceOrmManager.getRepositoryWithContextPermissions<TRecord>(
        objectNameSingular,
      )
    : workspaceOrmManager.getRepository<TRecord>(objectNameSingular, {
        shouldBypassPermissionChecks: true,
      });
