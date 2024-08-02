import { EntityManager } from 'typeorm';

const tableName = 'messageThread';

export const DEV_SEED_MESSAGE_THREAD_IDS = {
  MESSAGE_THREAD_1: '20202020-8bfa-453b-b99b-bc435a7d4da8',
  MESSAGE_THREAD_2: '20202020-634a-4fde-aa7c-28a0eaf203ca',
  MESSAGE_THREAD_3: '20202020-1b56-4f10-a2fa-2ccaddf81f6c',
  MESSAGE_THREAD_4: '20202020-d51c-485a-b1b6-ed7c63e05d72',
  MESSAGE_THREAD_5: '20202020-3f74-492d-a101-2a70f50a1645',
};

export const seedMessageThread = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'createdAt',
      'updatedAt',
      'deletedAt',
    ])
    .orIgnore()
    .values([
      {
        id: DEV_SEED_MESSAGE_THREAD_IDS.MESSAGE_THREAD_1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: DEV_SEED_MESSAGE_THREAD_IDS.MESSAGE_THREAD_2,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: DEV_SEED_MESSAGE_THREAD_IDS.MESSAGE_THREAD_3,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: DEV_SEED_MESSAGE_THREAD_IDS.MESSAGE_THREAD_4,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ])
    .execute();
};
