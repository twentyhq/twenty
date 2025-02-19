import { EntityManager } from 'typeorm';

import { DEV_SEED_MESSAGE_IDS } from 'src/database/typeorm-seeds/workspace/messages';
import { DEV_SEED_PERSON_IDS } from 'src/database/typeorm-seeds/workspace/seedPeople';
import { DEV_SEED_WORKSPACE_MEMBER_IDS } from 'src/database/typeorm-seeds/workspace/workspace-members';

const tableName = 'messageParticipant';

export const DEV_SEED_MESSAGE_PARTICIPANT_IDS = {
  MESSAGE_PARTICIPANT_1: '20202020-0f2a-49d8-8aa2-ec8786153a0b',
  MESSAGE_PARTICIPANT_2: '20202020-4e83-41ec-93e2-fd70ff09f68c',
  MESSAGE_PARTICIPANT_3: '20202020-e716-4dd5-ac61-3315bc559e2d',
  MESSAGE_PARTICIPANT_4: '20202020-fc7d-4ad8-9aea-b78bcbf79cdd',
  MESSAGE_PARTICIPANT_5: '20202020-564c-4a3c-abbf-e942e8c3f9c9',
  MESSAGE_PARTICIPANT_6: '20202020-7e4a-489a-ba6b-1ae6b7d721ac',
};

export const seedMessageParticipant = async (
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
      'workspaceMemberId',
      'personId',
      'displayName',
      'handle',
      'role',
      'messageId',
    ])
    .orIgnore()
    .values([
      {
        id: DEV_SEED_MESSAGE_PARTICIPANT_IDS.MESSAGE_PARTICIPANT_1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        workspaceMemberId: DEV_SEED_WORKSPACE_MEMBER_IDS.TIM,
        personId: DEV_SEED_PERSON_IDS.CHRISTOPH,
        displayName: 'Christoph',
        handle: 'outgoing',
        role: 'from',
        messageId: DEV_SEED_MESSAGE_IDS.MESSAGE_1,
      },
      {
        id: DEV_SEED_MESSAGE_PARTICIPANT_IDS.MESSAGE_PARTICIPANT_2,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        workspaceMemberId: DEV_SEED_WORKSPACE_MEMBER_IDS.TIM,
        personId: DEV_SEED_PERSON_IDS.SYLVIE,
        displayName: 'Sylvie',
        handle: 'incoming',
        role: 'to',
        messageId: DEV_SEED_MESSAGE_IDS.MESSAGE_1,
      },
      {
        id: DEV_SEED_MESSAGE_PARTICIPANT_IDS.MESSAGE_PARTICIPANT_3,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        workspaceMemberId: DEV_SEED_WORKSPACE_MEMBER_IDS.TIM,
        personId: DEV_SEED_PERSON_IDS.CHRISTOPHER_G,
        displayName: 'Christopher',
        handle: 'incoming',
        role: 'to',
        messageId: DEV_SEED_MESSAGE_IDS.MESSAGE_1,
      },
      {
        id: DEV_SEED_MESSAGE_PARTICIPANT_IDS.MESSAGE_PARTICIPANT_4,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        workspaceMemberId: DEV_SEED_WORKSPACE_MEMBER_IDS.TIM,
        personId: DEV_SEED_PERSON_IDS.CHRISTOPH,
        displayName: 'Christoph',
        handle: 'outgoing',
        role: 'from',
        messageId: DEV_SEED_MESSAGE_IDS.MESSAGE_2,
      },
      {
        id: DEV_SEED_MESSAGE_PARTICIPANT_IDS.MESSAGE_PARTICIPANT_5,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        workspaceMemberId: DEV_SEED_WORKSPACE_MEMBER_IDS.TIM,
        personId: DEV_SEED_PERSON_IDS.SYLVIE,
        displayName: 'Sylvie',
        handle: 'incoming',
        role: 'to',
        messageId: DEV_SEED_MESSAGE_IDS.MESSAGE_2,
      },
      {
        id: DEV_SEED_MESSAGE_PARTICIPANT_IDS.MESSAGE_PARTICIPANT_6,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        workspaceMemberId: DEV_SEED_WORKSPACE_MEMBER_IDS.TIM,
        personId: DEV_SEED_PERSON_IDS.CHRISTOPHER_G,
        displayName: 'Christopher',
        handle: 'incoming',
        role: 'to',
        messageId: DEV_SEED_MESSAGE_IDS.MESSAGE_2,
      },
    ])
    .execute();
};
