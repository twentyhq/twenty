import { DataSource } from 'typeorm';

import { seedFeatureFlags } from 'src/database/typeorm-seeds/core/feature-flags';
import { seedUserWorkspaces } from 'src/database/typeorm-seeds/core/user-workspaces';
import { seedUsers } from 'src/database/typeorm-seeds/core/users';
import { seedWorkspaces } from 'src/database/typeorm-seeds/core/workspaces';

export const seedCoreSchema = async (
  workspaceDataSource: DataSource,
  workspaceId: string,
) => {
  const schemaName = 'core';

  await seedWorkspaces(workspaceDataSource, schemaName, workspaceId);
  await seedUsers(workspaceDataSource, schemaName);
  await seedUserWorkspaces(workspaceDataSource, schemaName, workspaceId);
  await seedFeatureFlags(workspaceDataSource, schemaName, workspaceId);
};
