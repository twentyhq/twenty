import { EntityManager } from 'typeorm';

const tableName = 'integration';

export const DEV_SEED_INTEGRATION_IDS = {
  INTER: '20202020-16b9-4c35-9efc-5fc957a3a74d',
  STRIPE: '20202020-0973-44bb-917e-de454907c394',
};

export const seedIntegration = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, ['id', 'name', 'position'])
    .orIgnore()
    .values([
      {
        id: DEV_SEED_INTEGRATION_IDS.STRIPE,
        name: 'Stripe',
        position: 1,
      },
      {
        id: DEV_SEED_INTEGRATION_IDS.INTER,
        name: 'Inter',
        position: 2,
      },
    ])
    .execute();
};
