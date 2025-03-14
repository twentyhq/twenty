import { DataSource } from 'typeorm';

import { deleteFeatureFlags } from 'src/database/typeorm-seeds/core/demo/feature-flags';
import {
  deleteUserWorkspaces,
  seedUserWorkspaces,
} from 'src/database/typeorm-seeds/core/demo/user-workspaces';
import {
  deleteUsersByWorkspace,
  seedUsers,
} from 'src/database/typeorm-seeds/core/demo/users';
import {
  deleteWorkspaces,
  seedWorkspaces,
} from 'src/database/typeorm-seeds/core/demo/workspaces';

// What is this abstraction ?
export const seedDemoCoreSchema = async (
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
