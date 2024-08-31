import { EntityManager } from 'typeorm';

import { DEV_SEED_MESSAGE_CHANNEL_IDS } from 'src/database/typeorm-seeds/workspace/message-channels';
import { DEV_SEED_MESSAGE_IDS } from 'src/database/typeorm-seeds/workspace/messages';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';

const tableName = 'messageChannelMessageAssociation';

export const DEV_SEED_MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_IDS = {
  MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_1: '20202020-cc69-44ef-a82c-600c0dbf39ba',
  MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_2: '20202020-d80e-4a13-b10b-72ba09082668',
  MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_3: '20202020-e6ec-4c8a-b431-0901eaf395a9',
};

export const seedMessageChannelMessageAssociation = async (
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
      'messageThreadExternalId',
      'messageExternalId',
      'messageId',
      'messageChannelId',
      'direction',
    ])
    .orIgnore()
    .values([
      {
        id: DEV_SEED_MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_IDS.MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        messageThreadExternalId: null,
        messageExternalId: null,
        messageId: DEV_SEED_MESSAGE_IDS.MESSAGE_1,
        messageChannelId: DEV_SEED_MESSAGE_CHANNEL_IDS.TIM,
        direction: MessageDirection.OUTGOING,
      },
      {
        id: DEV_SEED_MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_IDS.MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_2,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        messageThreadExternalId: null,
        messageExternalId: null,
        messageId: DEV_SEED_MESSAGE_IDS.MESSAGE_2,
        messageChannelId: DEV_SEED_MESSAGE_CHANNEL_IDS.TIM,
        direction: MessageDirection.OUTGOING,
      },
      {
        id: DEV_SEED_MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_IDS.MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_3,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        messageThreadExternalId: null,
        messageExternalId: null,
        messageId: DEV_SEED_MESSAGE_IDS.MESSAGE_3,
        messageChannelId: DEV_SEED_MESSAGE_CHANNEL_IDS.TIM,
        direction: MessageDirection.INCOMING,
      },
    ])
    .execute();
};
