import { EntityManager } from 'typeorm';

import { DEV_SEED_CONNECTED_ACCOUNT_IDS } from 'src/database/typeorm-seeds/workspace/connected-account';

const tableName = 'messageChannel';

export const DEV_SEED_MESSAGE_CHANNEL_IDS = {
  TIM_INCOMING: '20202020-9b80-4c2c-a597-383db48de1d6',
  TIM_OUTGOING: '20202020-09ed-4eb9-8b23-62aa4fd81d83',
  JONY_INCOMING: '20202020-5ffe-4b32-814a-983d5e4911cd',
  JONY_OUTGOING: '20202020-9dad-4329-8180-62647a2d7510',
  PHIL_INCOMING: '20202020-e2f1-49b5-85d2-5d3a3386990c',
  PHIL_OUTGOING: '20202020-fdff-438f-9132-7d5f216dfc4d',
};

export const seedMessageChannel = async (
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
      'isContactAutoCreationEnabled',
      'type',
      'connectedAccountId',
      'handle',
      'visibility',
    ])
    .orIgnore()
    .values([
      {
        id: DEV_SEED_MESSAGE_CHANNEL_IDS.TIM_INCOMING,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isContactAutoCreationEnabled: true,
        type: 'email',
        connectedAccountId: DEV_SEED_CONNECTED_ACCOUNT_IDS.TIM,
        handle: 'outgoing',
        visibility: 'share_everything',
      },
      {
        id: DEV_SEED_MESSAGE_CHANNEL_IDS.TIM_OUTGOING,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isContactAutoCreationEnabled: true,
        type: 'email',
        connectedAccountId: DEV_SEED_CONNECTED_ACCOUNT_IDS.TIM,
        handle: 'incoming',
        visibility: 'share_everything',
      },
      {
        id: DEV_SEED_MESSAGE_CHANNEL_IDS.JONY_INCOMING,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isContactAutoCreationEnabled: true,
        type: 'email',
        connectedAccountId: DEV_SEED_CONNECTED_ACCOUNT_IDS.JONY,
        handle: 'outgoing',
        visibility: 'share_everything',
      },
      {
        id: DEV_SEED_MESSAGE_CHANNEL_IDS.JONY_OUTGOING,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isContactAutoCreationEnabled: true,
        type: 'email',
        connectedAccountId: DEV_SEED_CONNECTED_ACCOUNT_IDS.JONY,
        handle: 'incoming',
        visibility: 'share_everything',
      },
      {
        id: DEV_SEED_MESSAGE_CHANNEL_IDS.PHIL_INCOMING,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isContactAutoCreationEnabled: true,
        type: 'email',
        connectedAccountId: DEV_SEED_CONNECTED_ACCOUNT_IDS.PHIL,
        handle: 'outgoing',
        visibility: 'share_everything',
      },
      {
        id: DEV_SEED_MESSAGE_CHANNEL_IDS.PHIL_OUTGOING,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isContactAutoCreationEnabled: true,
        type: 'email',
        connectedAccountId: DEV_SEED_CONNECTED_ACCOUNT_IDS.PHIL,
        handle: 'incoming',
        visibility: 'share_everything',
      },
    ])
    .execute();
};
