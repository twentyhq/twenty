import { DataSource } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

const tableName = 'featureFlag';

export const seedFeatureFlags = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await dataSource
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
        key: FeatureFlagKey.IsStripeIntegrationEnabled,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IsWorkflowEnabled,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IsCustomDomainEnabled,
        workspaceId: workspaceId,
        value: false,
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
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await dataSource
    .createQueryBuilder()
    .delete()
    .from(`${schemaName}.${tableName}`)
    .where(`"${tableName}"."workspaceId" = :workspaceId`, { workspaceId })
    .execute();
};
