import { DataSource } from 'typeorm';

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
        key: 'IS_RELATION_FIELD_TYPE_ENABLED',
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: 'IS_MESSAGING_ENABLED',
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: 'IS_NOTE_CREATE_IMAGES_ENABLED',
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: 'IS_SELECT_FIELD_TYPE_ENABLED',
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: 'IS_RATING_FIELD_TYPE_ENABLED',
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
