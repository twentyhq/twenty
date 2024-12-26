import { EntityManager } from 'typeorm';

import { DEV_SEED_PERSON_IDS } from 'src/database/typeorm-seeds/workspace/seedPeople';
import { DEV_SEED_WORKSPACE_MEMBER_IDS } from 'src/database/typeorm-seeds/workspace/workspace-members';
import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';

const tableName = 'calendarEventParticipant';

export const seedCalendarEventParticipants = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
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
        id: 'da8f47c3-8055-49ad-b7e4-9c9d5bbc1ecc',
        calendarEventId: '86083141-1c0e-494c-a1b6-85b1c6fefaa5',
        handle: 'christoph.calisto@linkedin.com',
        displayName: 'Christoph Calisto',
        isOrganizer: true,
        responseStatus: CalendarEventParticipantResponseStatus.ACCEPTED,
        personId: DEV_SEED_PERSON_IDS.CHRISTOPH,
        workspaceMemberId: null,
      },
      {
        id: 'e1ab9e1b-df6e-438e-a788-11c96dcecdd3',
        calendarEventId: '86083141-1c0e-494c-a1b6-85b1c6fefaa5',
        handle: 'tim@apple.com',
        displayName: 'Tim Apple',
        isOrganizer: false,
        responseStatus: CalendarEventParticipantResponseStatus.ACCEPTED,
        personId: null,
        workspaceMemberId: DEV_SEED_WORKSPACE_MEMBER_IDS.TIM,
      },
    ])
    .execute();
};
