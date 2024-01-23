import { DataSource } from 'typeorm';

import { FeatureFlagKeys } from 'src/core/feature-flag/feature-flag.entity';

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
        key: FeatureFlagKeys.IsMessagingEnabled,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKeys.IsRatingFieldTypeEnabled,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKeys.IsWorkspaceCleanable,
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
