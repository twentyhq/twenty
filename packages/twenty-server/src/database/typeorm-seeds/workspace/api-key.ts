import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';

const tableName = 'apiKey';

const API_KEY_ID = '20202020-f401-4d8a-a731-64d007c27bad';

export const seedApiKey = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.${tableName}`, ['id', 'name', 'expiresAt'])
    .orIgnore()
    .values([
      {
        id: API_KEY_ID,
        name: 'My api key',
        expiresAt: new Date(
          new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 100, // In 100 years
        ),
      },
    ])
    .execute();
};
