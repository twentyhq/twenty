import { DataSource } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

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
        key: FeatureFlagKey.IsAirtableIntegrationEnabled,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IsPostgreSQLIntegrationEnabled,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IsEventObjectEnabled,
        workspaceId: workspaceId,
        value: false,
      },
      {
        key: FeatureFlagKey.IsStripeIntegrationEnabled,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IsFunctionSettingsEnabled,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IsWorkflowEnabled,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IsMessageThreadSubscriberEnabled,
        workspaceId: workspaceId,
        value: false,
      },
      {
        key: FeatureFlagKey.IsWorkspaceFavoriteEnabled,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IsAnalyticsV2Enabled,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IsGmailSendEmailScopeEnabled,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IsUniqueIndexesEnabled,
        workspaceId: workspaceId,
        value: false,
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
