import { EntityManager } from 'typeorm';

const tableName = 'apiKey';

const API_KEY_ID = '20202020-f401-4d8a-a731-64d007c27bad';

export const seedApiKey = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'name',
      'createdAt',
      'updatedAt',
      'deletedAt',
      'expiresAt',
      'revokedAt',
    ])
    .orIgnore()
    .values([
      {
        id: API_KEY_ID,
        name: 'My api key',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        expiresAt: new Date(
          new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 100, // In 100 years
        ),
        revokedAt: null,
      },
    ])
    .execute();
};
