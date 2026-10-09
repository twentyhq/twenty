import { buildCallRecordingTranscriptSettingsUpdate } from 'src/database/commands/upgrade-version-command/2-46/utils/build-call-recording-transcript-settings-update.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { fromUniversalSettingsToFlatFieldMetadataSettings } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/utils/from-universal-settings-to-flat-field-metadata-settings.util';

describe('buildCallRecordingTranscriptSettingsUpdate', () => {
  it.each([undefined, null, {}])(
    'initializes an absent loading preference with settings %p',
    (settings) => {
      expect(
        buildCallRecordingTranscriptSettingsUpdate({
          settings,
          universalSettings: settings,
        }),
      ).toEqual({ universalSettings: { isValueLoadedOnOpen: true } });
    },
  );

  it.each([true, false])(
    'preserves an existing loading property: %p',
    (isValueLoadedOnOpen) => {
      expect(
        buildCallRecordingTranscriptSettingsUpdate({
          settings: { isValueLoadedOnOpen },
        }),
      ).toBeUndefined();
      expect(
        buildCallRecordingTranscriptSettingsUpdate({
          universalSettings: { isValueLoadedOnOpen },
        }),
      ).toBeUndefined();
    },
  );

  it('replaces a null loading property the validator would reject', () => {
    expect(
      buildCallRecordingTranscriptSettingsUpdate({
        settings: { legacySetting: 'preserved', isValueLoadedOnOpen: null },
      }),
    ).toEqual({
      universalSettings: {
        legacySetting: 'preserved',
        isValueLoadedOnOpen: true,
      },
    });
  });

  it.each([
    { settings: 'legacy settings' },
    { settings: 1 },
    { settings: false },
    { settings: [] },
    { settings: {}, universalSettings: [] },
  ])('preserves legacy settings without changing their shape: %p', (field) => {
    expect(buildCallRecordingTranscriptSettingsUpdate(field)).toBeUndefined();
  });

  it('preserves sibling settings and prefers the persisted value on conflicts', () => {
    expect(
      buildCallRecordingTranscriptSettingsUpdate({
        settings: { legacySetting: 'preserved', sharedSetting: 'local' },
        universalSettings: { universalSetting: 3, sharedSetting: 'universal' },
      }),
    ).toEqual({
      universalSettings: {
        legacySetting: 'preserved',
        universalSetting: 3,
        sharedSetting: 'local',
        isValueLoadedOnOpen: true,
      },
    });
  });

  it('does not change the original settings', () => {
    const settings = { legacySetting: 'preserved' };

    buildCallRecordingTranscriptSettingsUpdate({ settings });

    expect(settings).toEqual({ legacySetting: 'preserved' });
  });

  it('converts to flat settings and does not apply twice', () => {
    const update = buildCallRecordingTranscriptSettingsUpdate({
      settings: { legacySetting: 'preserved' },
    });
    const settings = fromUniversalSettingsToFlatFieldMetadataSettings({
      universalSettings: update?.universalSettings ?? null,
      allFieldIdToBeCreatedInActionByUniversalIdentifierMap: new Map(),
      flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
    });

    expect(settings).toEqual({
      legacySetting: 'preserved',
      isValueLoadedOnOpen: true,
    });
    expect(
      buildCallRecordingTranscriptSettingsUpdate({
        settings,
        universalSettings: update?.universalSettings,
      }),
    ).toBeUndefined();
  });
});
