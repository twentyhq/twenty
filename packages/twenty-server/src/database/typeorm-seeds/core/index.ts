import { DataSource } from 'typeorm';

import { seedUsers } from 'src/database/typeorm-seeds/core/users';
import { seedWorkspaces } from 'src/database/typeorm-seeds/core/workspaces';
import { seedFeatureFlags } from 'src/database/typeorm-seeds/core/feature-flags';
import { seedUserWorkspaces } from 'src/database/typeorm-seeds/core/userWorkspaces';

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
