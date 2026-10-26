import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

export const findLiveReadableRecordIdentifiers = async ({
  workspaceOrmManager,
  objectNameSingular,
  recordIds,
}: {
  workspaceOrmManager: WorkspaceOrmManager;
  objectNameSingular: string;
  recordIds: string[];
}): Promise<Set<string> | undefined> => {
  if (
    getWorkspaceContext().authContext.type === 'system' ||
    !isDefined(getWorkspaceContext().recordPermissionContext)
  )
    return undefined;
  const repository =
    workspaceOrmManager.getRepositoryWithContextPermissions(objectNameSingular);
  const identifiers = [...new Set(recordIds)];
  const allowed = new Set<string>();
  for (
    let offset = 0;
    offset < identifiers.length;
    offset += QUERY_MAX_RECORDS
  ) {
    const readable =
      await repository.findRecordIdsAllowedForRecordPermissionAction({
        recordIds: identifiers.slice(offset, offset + QUERY_MAX_RECORDS),
        action: 'read',
      });
    for (const id of readable ?? []) allowed.add(id);
  }
  return allowed;
};
