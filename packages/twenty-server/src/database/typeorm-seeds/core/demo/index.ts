import { DataSource } from 'typeorm';

import { deleteFeatureFlags } from 'src/database/typeorm-seeds/core/demo/feature-flags';
import { deleteUserWorkspaces } from 'src/database/typeorm-seeds/core/demo/user-workspaces';
import { deleteUsersByWorkspace } from 'src/database/typeorm-seeds/core/demo/users';
import { deleteWorkspaces } from 'src/database/typeorm-seeds/core/demo/workspaces';

export const deleteCoreSchema = async (
  workspaceDataSource: DataSource,
  workspaceId: string,
) => {
  const schemaName = 'core';

  await deleteUserWorkspaces(workspaceDataSource, schemaName, workspaceId);
  await deleteUsersByWorkspace(workspaceDataSource, schemaName, workspaceId);
  await deleteFeatureFlags(workspaceDataSource, schemaName, workspaceId);
  // deleteWorkspaces should be last
  await deleteWorkspaces(workspaceDataSource, schemaName, workspaceId);
};
