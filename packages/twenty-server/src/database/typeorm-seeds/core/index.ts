import { DataSource } from 'typeorm';

import { seedBillingSubscriptions } from 'src/database/typeorm-seeds/core/billing/billing-subscription';
import { seedFeatureFlags } from 'src/database/typeorm-seeds/core/feature-flags';
import { seedUserWorkspaces } from 'src/database/typeorm-seeds/core/user-workspaces';
import { seedUsers } from 'src/database/typeorm-seeds/core/users';
import { seedWorkspaces } from 'src/database/typeorm-seeds/core/workspaces';

// Test
type SeedCoreSchemaArgs = {
  workspaceDataSource: DataSource;
  workspaceId: string;
  isBillingEnabled: boolean;
  appVersion: string | undefined;
};
export const seedCoreSchema = async ({
  isBillingEnabled,
  appVersion,
  workspaceDataSource,
  workspaceId,
}: SeedCoreSchemaArgs) => {
  const schemaName = 'core';

  await seedWorkspaces({ workspaceDataSource, schemaName, workspaceId });
  await seedUsers(workspaceDataSource, schemaName);
  await seedUserWorkspaces(workspaceDataSource, schemaName, workspaceId);
  await seedFeatureFlags(workspaceDataSource, schemaName, workspaceId);

  if (isBillingEnabled) {
    await seedBillingSubscriptions(
      workspaceDataSource,
      schemaName,
      workspaceId,
    );
  }
};
