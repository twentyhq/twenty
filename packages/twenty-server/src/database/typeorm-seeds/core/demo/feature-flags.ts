import { DataSource } from 'typeorm';

const tableName = 'featureFlag';

// export const seedFeatureFlags = async (
//   workspaceDataSource: DataSource,
//   schemaName: string,
//   workspaceId: string,
// ) => {
//   await workspaceDataSource
//     .createQueryBuilder()
//     .insert()
//     .into(`${schemaName}.${tableName}`, ['key', 'workspaceId', 'value'])
//     .orIgnore()
//     .values([])
//     .execute();
// };

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
