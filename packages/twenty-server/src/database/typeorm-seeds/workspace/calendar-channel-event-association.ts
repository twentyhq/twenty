import { EntityManager } from 'typeorm';

const tableName = 'calendarChannelEventAssociation';

export const seedCalendarChannelEventAssociations = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'calendarChannelId',
      'calendarEventId',
      'eventExternalId',
      'recurringEventExternalId',
    ])
    .orIgnore()
    .values([
      {
        id: 'e1ab9e1b-df6e-438e-a788-11c96dcecdd3',
        calendarChannelId: '59efdefe-a40f-4faf-bb9f-c6f9945b8203',
        calendarEventId: '86083141-1c0e-494c-a1b6-85b1c6fefaa5',
        eventExternalId: 'exampleExternalId',
        recurringEventExternalId: 'exampleRecurringExternalId',
      },
    ])
    .execute();
};
