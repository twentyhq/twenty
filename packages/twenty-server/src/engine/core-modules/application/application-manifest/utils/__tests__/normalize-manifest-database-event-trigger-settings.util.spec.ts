import { normalizeManifestDatabaseEventTriggerSettings } from 'src/engine/core-modules/application/application-manifest/utils/normalize-manifest-database-event-trigger-settings.util';

describe('normalizeManifestDatabaseEventTriggerSettings', () => {
  it('returns null when the manifest declares no database event trigger', () => {
    expect(normalizeManifestDatabaseEventTriggerSettings(undefined)).toBeNull();
    expect(normalizeManifestDatabaseEventTriggerSettings(null)).toBeNull();
  });

  it('keeps a list of triggers as is', () => {
    const triggers = [
      { eventName: 'person.created' },
      { eventName: 'person.updated', updatedFields: ['city'] },
    ];

    expect(normalizeManifestDatabaseEventTriggerSettings(triggers)).toBe(
      triggers,
    );
  });

  it('wraps the single trigger object of a manifest built with an older SDK', () => {
    expect(
      normalizeManifestDatabaseEventTriggerSettings({
        eventName: 'person.created',
        batchMode: true,
      }),
    ).toEqual([{ eventName: 'person.created', batchMode: true }]);
  });
});
