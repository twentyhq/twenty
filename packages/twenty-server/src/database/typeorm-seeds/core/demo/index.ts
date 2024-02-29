import { DataSource } from 'typeorm';

import {
  seedUsers,
  deleteUsersByWorkspace,
} from 'src/database/typeorm-seeds/core/demo/users';
import {
  seedWorkspaces,
  deleteWorkspaces,
} from 'src/database/typeorm-seeds/core/demo/workspaces';
import { deleteFeatureFlags } from 'src/database/typeorm-seeds/core/demo/feature-flags';

export const seedCoreSchema = async (
  workspaceDataSource: DataSource,
  workspaceId: string,
) => {
  const schemaName = 'core';

  await seedWorkspaces(workspaceDataSource, schemaName, workspaceId);
  await seedUsers(workspaceDataSource, schemaName, workspaceId);
};

export const deleteCoreSchema = async (
  workspaceDataSource: DataSource,
  workspaceId: string,
) => {
  const schemaName = 'core';

  await deleteUsersByWorkspace(workspaceDataSource, schemaName, workspaceId);
  await deleteFeatureFlags(workspaceDataSource, schemaName, workspaceId);
  // deleteWorkspaces should be last
  await deleteWorkspaces(workspaceDataSource, schemaName, workspaceId);
};
