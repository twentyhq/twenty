import { DataSource } from 'typeorm';

import { seedBillingSubscriptions } from 'src/database/typeorm-seeds/core/billing/billing-subscription';
import { seedFeatureFlags } from 'src/database/typeorm-seeds/core/feature-flags';
import { seedUserWorkspaces } from 'src/database/typeorm-seeds/core/user-workspaces';
import { seedUsers } from 'src/database/typeorm-seeds/core/users';
import { seedWorkspaces } from 'src/database/typeorm-seeds/core/workspaces';

type SeedCoreSchemaArgs = {
  dataSource: DataSource;
  workspaceId: string;
  appVersion: string | undefined;
  seedBilling?: boolean;
  seedFeatureFlags?: boolean;
};

export const seedCoreSchema = async ({
  appVersion,
  dataSource,
  workspaceId,
  seedBilling = true,
  seedFeatureFlags: shouldSeedFeatureFlags = true,
}: SeedCoreSchemaArgs) => {
  const schemaName = 'core';

  await seedWorkspaces({
    dataSource,
    schemaName,
    workspaceId,
    appVersion,
  });
  await seedUsers(dataSource, schemaName);
  await seedUserWorkspaces(dataSource, schemaName, workspaceId);

  if (shouldSeedFeatureFlags) {
    await seedFeatureFlags(dataSource, schemaName, workspaceId);
  }

  if (seedBilling) {
    await seedBillingSubscriptions(dataSource, schemaName, workspaceId);
  }
};
