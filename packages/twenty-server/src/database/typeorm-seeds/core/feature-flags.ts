import { DataSource } from 'typeorm';

import { FeatureFlagKeys } from 'src/engine/core-modules/feature-flag/feature-flag.entity';

const tableName = 'featureFlag';

export const seedFeatureFlags = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, ['key', 'workspaceId', 'value'])
    .orIgnore()
    .values([
      {
        key: FeatureFlagKeys.IsBlocklistEnabled,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKeys.IsAirtableIntegrationEnabled,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKeys.IsPostgreSQLIntegrationEnabled,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKeys.IsEventObjectEnabled,
        workspaceId: workspaceId,
        value: false,
      },
      {
        key: FeatureFlagKeys.IsStripeIntegrationEnabled,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKeys.IsContactCreationForSentAndReceivedEmailsEnabled,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKeys.IsGoogleCalendarSyncV2Enabled,
        workspaceId: workspaceId,
        value: true,
      },
    ])
    .execute();
};

export const deleteFeatureFlags = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .delete()
    .from(`${schemaName}.${tableName}`)
    .where(`"${tableName}"."workspaceId" = :workspaceId`, { workspaceId })
    .execute();
};
