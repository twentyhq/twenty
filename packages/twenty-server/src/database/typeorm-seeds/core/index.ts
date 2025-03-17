import { DataSource } from 'typeorm';

import { seedBillingSubscriptions } from 'src/database/typeorm-seeds/core/billing/billing-subscription';
import { seedFeatureFlags } from 'src/database/typeorm-seeds/core/feature-flags';
import { seedUserWorkspaces } from 'src/database/typeorm-seeds/core/user-workspaces';
import { seedUsers } from 'src/database/typeorm-seeds/core/users';
import { seedWorkspaces } from 'src/database/typeorm-seeds/core/workspaces';

type SeedCoreSchemaCommonArgs = {
  workspaceDataSource: DataSource;
  workspaceId: string;
  appVersion: string | undefined;
};

type SeedCoreSchemaArgs = SeedCoreSchemaCommonArgs &
  (
    | {
        type: 'dev';
        isBillingEnabled: boolean;
      }
    | {
        type: 'demo';
      }
  );
export const seedCoreSchema = async ({
  appVersion,
  workspaceDataSource,
  workspaceId,
  ...rest
}: SeedCoreSchemaArgs) => {
  const { type } = rest;
  const schemaName = 'core';

  await seedWorkspaces({
    workspaceDataSource,
    schemaName,
    workspaceId,
    version: appVersion,
  });
  await seedUsers(workspaceDataSource, schemaName);
  await seedUserWorkspaces(workspaceDataSource, schemaName, workspaceId);

  if (type === 'dev') {
    const { isBillingEnabled } = rest;

    await seedFeatureFlags(workspaceDataSource, schemaName, workspaceId);
    if (isBillingEnabled) {
      await seedBillingSubscriptions(
        workspaceDataSource,
        schemaName,
        workspaceId,
      );
    }
  }
};
