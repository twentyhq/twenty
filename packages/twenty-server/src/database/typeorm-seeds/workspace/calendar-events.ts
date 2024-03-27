import { EntityManager } from 'typeorm';

const tableName = 'calendarEvent';

export const seedCalendarEvents = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'title',
      'isCanceled',
      'isFullDay',
      'startsAt',
      'endsAt',
      'externalCreatedAt',
      'externalUpdatedAt',
      'description',
      'location',
      'iCalUID',
      'conferenceSolution',
      'conferenceLinkLabel',
      'conferenceLinkUrl',
      'recurringEventExternalId',
    ])
    .orIgnore()
    .values([
      {
        id: '86083141-1c0e-494c-a1b6-85b1c6fefaa5',
        title: 'Meeting with Christoph',
        isCanceled: false,
        isFullDay: false,
        startsAt: new Date(new Date().setHours(10, 0)).toISOString(),
        endsAt: new Date(new Date().setHours(11, 0)).toISOString(),
        externalCreatedAt: new Date().toISOString(),
        externalUpdatedAt: new Date().toISOString(),
        description: 'Discuss project progress',
        location: 'Seattle',
        iCalUID: 'event1@calendar.com',
        conferenceSolution: 'Zoom',
        conferenceLinkLabel: 'https://zoom.us/j/1234567890',
        conferenceLinkUrl: 'https://zoom.us/j/1234567890',
        recurringEventExternalId: 'recurring1',
      },
    ])
    .execute();
};
