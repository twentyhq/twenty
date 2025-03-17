import { DataSource } from 'typeorm';

import { seedBillingSubscriptions } from 'src/database/typeorm-seeds/core/billing/billing-subscription';
import { seedFeatureFlags } from 'src/database/typeorm-seeds/core/feature-flags';
import { seedUserWorkspaces } from 'src/database/typeorm-seeds/core/user-workspaces';
import { seedUsers } from 'src/database/typeorm-seeds/core/users';
import { seedWorkspaces } from 'src/database/typeorm-seeds/core/workspaces';

type SeedCoreSchemaArgs = {
  workspaceDataSource: DataSource;
  workspaceId: string;
  appVersion: string | undefined;
  seedBilling?: boolean;
  seedFeatureFlags?: boolean;
};

export const seedCoreSchema = async ({
  appVersion,
  workspaceDataSource,
  workspaceId,
  seedBilling = true,
  seedFeatureFlags: shouldSeedFeatureFlags = true,
}: SeedCoreSchemaArgs) => {
  const schemaName = 'core';

  await seedWorkspaces({
    workspaceDataSource,
    schemaName,
    workspaceId,
    appVersion,
  });
  await seedUsers(workspaceDataSource, schemaName);
  await seedUserWorkspaces(workspaceDataSource, schemaName, workspaceId);

  if (shouldSeedFeatureFlags) {
    await seedFeatureFlags(workspaceDataSource, schemaName, workspaceId);
  }

  if (seedBilling) {
    await seedBillingSubscriptions(
      workspaceDataSource,
      schemaName,
      workspaceId,
    );
  }
};
