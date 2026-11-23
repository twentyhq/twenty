import { toStoredDatabaseEventTriggerSettingsOrThrow } from 'src/engine/core-modules/application/application-manifest/utils/to-stored-database-event-trigger-settings-or-throw.util';

describe('toStoredDatabaseEventTriggerSettingsOrThrow', () => {
  it('refuses settings that were not resolved', () => {
    expect(() =>
      toStoredDatabaseEventTriggerSettingsOrThrow({
        on: 'recordEvent',
        action: 'created',
      }),
    ).toThrow(/must be resolved/);
    expect(
      toStoredDatabaseEventTriggerSettingsOrThrow({
        eventName: 'company.created',
      }),
    ).toEqual({ eventName: 'company.created' });
  });
});
