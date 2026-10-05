import { findDatabaseEventTriggersMatchingEventName } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/find-database-event-triggers-matching-event-name';

describe('findDatabaseEventTriggersMatchingEventName', () => {
  it('keeps the triggers listening on the event, exact or wildcard', () => {
    expect(
      findDatabaseEventTriggersMatchingEventName({
        databaseEventTriggerSettings: [
          { eventName: 'person.created' },
          { eventName: '*.created' },
          { eventName: 'person.*' },
          { eventName: '*.*' },
          { eventName: 'company.created' },
          { eventName: 'person.updated' },
        ],
        eventName: 'person.created',
      }).map((trigger) => trigger.eventName),
    ).toEqual(['person.created', '*.created', 'person.*', '*.*']);
  });

  it('returns nothing without triggers', () => {
    expect(
      findDatabaseEventTriggersMatchingEventName({
        databaseEventTriggerSettings: null,
        eventName: 'person.created',
      }),
    ).toEqual([]);
    expect(
      findDatabaseEventTriggersMatchingEventName({
        databaseEventTriggerSettings: [],
        eventName: 'person.created',
      }),
    ).toEqual([]);
  });

  it('still matches a function whose cached settings hold a single trigger object', () => {
    expect(
      findDatabaseEventTriggersMatchingEventName({
        databaseEventTriggerSettings: { eventName: 'person.created' },
        eventName: 'person.created',
      }),
    ).toEqual([{ eventName: 'person.created' }]);
  });
});
