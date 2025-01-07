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
import {
  deleteUserWorkspaces,
  seedUserWorkspaces,
} from 'src/database/typeorm-seeds/core/demo/user-workspaces';

export const seedCoreSchema = async (
  workspaceDataSource: DataSource,
  workspaceId: string,
) => {
  const schemaName = 'core';

  await seedWorkspaces(workspaceDataSource, schemaName, workspaceId);
  await seedUsers(workspaceDataSource, schemaName);
  await seedUserWorkspaces(workspaceDataSource, schemaName, workspaceId);
};

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
