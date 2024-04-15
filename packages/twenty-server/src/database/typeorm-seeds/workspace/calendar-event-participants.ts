import { EntityManager } from 'typeorm';

import { DEV_SEED_PERSON_IDS } from 'src/database/typeorm-seeds/workspace/people';
import { DEV_SEED_WORKSPACE_MEMBER_IDS } from 'src/database/typeorm-seeds/workspace/workspace-members';

const tableName = 'calendarEventParticipant';

export const seedCalendarEventParticipants = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'calendarEventId',
      'handle',
      'displayName',
      'isOrganizer',
      'responseStatus',
      'personId',
      'workspaceMemberId',
    ])
    .orIgnore()
    .values([
      {
        calendarEventId: '86083141-1c0e-494c-a1b6-85b1c6fefaa5',
        handle: 'christoph.calisto@linkedin.com',
        displayName: 'Christoph Calisto',
        isOrganizer: true,
        responseStatus: 'accepted',
        personId: DEV_SEED_PERSON_IDS.CHRISTOPH,
        workspaceMemberId: null,
      },
      {
        calendarEventId: '86083141-1c0e-494c-a1b6-85b1c6fefaa5',
        handle: 'tim@apple.com',
        displayName: 'Tim Apple',
        isOrganizer: false,
        responseStatus: 'accepted',
        personId: null,
        workspaceMemberId: DEV_SEED_WORKSPACE_MEMBER_IDS.TIM,
      },
    ])
    .execute();
};
