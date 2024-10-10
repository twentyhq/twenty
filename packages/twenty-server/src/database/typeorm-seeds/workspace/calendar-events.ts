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
      'conferenceLinkPrimaryLinkLabel',
      'conferenceLinkPrimaryLinkUrl',
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
        conferenceLinkPrimaryLinkLabel: 'https://zoom.us/j/1234567890',
        conferenceLinkPrimaryLinkUrl: 'https://zoom.us/j/1234567890',
      },
    ])
    .execute();
};
