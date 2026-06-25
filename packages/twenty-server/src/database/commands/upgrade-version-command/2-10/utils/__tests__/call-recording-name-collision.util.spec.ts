import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';

import {
  buildCalendarEventFieldRenameUpdates,
  buildCallRecordingObjectRenameUpdates,
  findCalendarEventFieldNameCollisionsForCallRecording,
  findCallRecordingObjectNameCollisions,
  LEGACY_CALENDAR_EVENT_RECORDING_PREFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
  resolveAvailableOldCalendarEventFieldName,
  resolveAvailableOldCallRecordingObjectNames,
} from 'src/database/commands/upgrade-version-command/2-10/utils/call-recording-name-collision.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const NOW = '2026-06-04T00:00:00.000Z';
const CALENDAR_EVENT_OBJECT_METADATA_ID = 'calendar-event-object-metadata-id';

const buildFlatObjectMetadataMaps = (
  flatObjectMetadatas: FlatObjectMetadata[],
): FlatEntityMaps<FlatObjectMetadata> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatObjectMetadatas.map((flatObjectMetadata) => [
      flatObjectMetadata.universalIdentifier,
      flatObjectMetadata,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatObjectMetadatas.map((flatObjectMetadata) => [
      flatObjectMetadata.id,
      flatObjectMetadata.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildFlatFieldMetadataMaps = (
  flatFieldMetadatas: FlatFieldMetadata[],
): FlatEntityMaps<FlatFieldMetadata> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.universalIdentifier,
      flatFieldMetadata,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.id,
      flatFieldMetadata.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

const getCalendarEventFieldMetadataMock = (
  overrides: Pick<FlatFieldMetadata, 'name' | 'universalIdentifier'> &
    Partial<FlatFieldMetadata>,
): FlatFieldMetadata =>
  getFlatFieldMetadataMock({
    objectMetadataId: CALENDAR_EVENT_OBJECT_METADATA_ID,
    objectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.calendarEvent.universalIdentifier,
    type: FieldMetadataType.TEXT,
    label: overrides.name,
    ...overrides,
  });

describe('findCallRecordingObjectNameCollisions', () => {
  it('returns an empty array when no object uses the callRecording name', () => {
    const maps = buildFlatObjectMetadataMaps([
      getFlatObjectMetadataMock({
        universalIdentifier: 'unrelated-object',
        nameSingular: 'invoice',
        namePlural: 'invoices',
      }),
    ]);

    expect(findCallRecordingObjectNameCollisions(maps)).toEqual([]);
  });

  it('returns the custom object whose singular name collides', () => {
    const maps = buildFlatObjectMetadataMaps([
      getFlatObjectMetadataMock({
        universalIdentifier: 'colliding-singular',
        nameSingular: 'callRecording',
        namePlural: 'myRecordings',
      }),
    ]);

    expect(
      findCallRecordingObjectNameCollisions(maps).map(
        (object) => object.universalIdentifier,
      ),
    ).toEqual(['colliding-singular']);
  });

  it('returns the custom object whose plural name collides', () => {
    const maps = buildFlatObjectMetadataMaps([
      getFlatObjectMetadataMock({
        universalIdentifier: 'colliding-plural',
        nameSingular: 'myRecording',
        namePlural: 'callRecordings',
      }),
    ]);

    expect(
      findCallRecordingObjectNameCollisions(maps).map(
        (object) => object.universalIdentifier,
      ),
    ).toEqual(['colliding-plural']);
  });

  it('returns every colliding object when singular and plural collide on different objects', () => {
    const maps = buildFlatObjectMetadataMaps([
      getFlatObjectMetadataMock({
        universalIdentifier: 'colliding-singular',
        nameSingular: 'callRecording',
        namePlural: 'myRecordings',
      }),
      getFlatObjectMetadataMock({
        universalIdentifier: 'colliding-plural',
        nameSingular: 'myRecording',
        namePlural: 'callRecordings',
      }),
    ]);

    expect(
      findCallRecordingObjectNameCollisions(maps)
        .map((object) => object.universalIdentifier)
        .sort(),
    ).toEqual(['colliding-plural', 'colliding-singular']);
  });

  it('excludes the standard callRecording object itself', () => {
    const maps = buildFlatObjectMetadataMaps([
      getFlatObjectMetadataMock({
        universalIdentifier: STANDARD_OBJECTS.callRecording.universalIdentifier,
        nameSingular: 'callRecording',
        namePlural: 'callRecordings',
        isCustom: false,
        isSystem: true,
      }),
    ]);

    expect(findCallRecordingObjectNameCollisions(maps)).toEqual([]);
  });
});

describe('resolveAvailableOldCallRecordingObjectNames', () => {
  it('returns the unsuffixed Old names when none are taken', () => {
    const maps = buildFlatObjectMetadataMaps([
      getFlatObjectMetadataMock({
        universalIdentifier: 'colliding',
        nameSingular: 'callRecording',
        namePlural: 'callRecordings',
      }),
    ]);

    expect(resolveAvailableOldCallRecordingObjectNames(maps)).toEqual({
      nameSingular: 'callRecordingOld',
      namePlural: 'callRecordingsOld',
      labelSingular: 'Call Recording (Old)',
      labelPlural: 'Call Recordings (Old)',
    });
  });

  it('advances to the next discriminator when the Old name is already taken', () => {
    const maps = buildFlatObjectMetadataMaps([
      getFlatObjectMetadataMock({
        universalIdentifier: 'colliding',
        nameSingular: 'callRecording',
        namePlural: 'callRecordings',
      }),
      getFlatObjectMetadataMock({
        universalIdentifier: 'old-already-taken',
        nameSingular: 'callRecordingOld',
        namePlural: 'callRecordingsOld',
      }),
    ]);

    expect(resolveAvailableOldCallRecordingObjectNames(maps)).toEqual({
      nameSingular: 'callRecordingOld2',
      namePlural: 'callRecordingsOld2',
      labelSingular: 'Call Recording (Old) 2',
      labelPlural: 'Call Recordings (Old) 2',
    });
  });

  it('skips Old names provided as already reserved', () => {
    const maps = buildFlatObjectMetadataMaps([
      getFlatObjectMetadataMock({
        universalIdentifier: 'colliding',
        nameSingular: 'callRecording',
        namePlural: 'callRecordings',
      }),
    ]);

    expect(
      resolveAvailableOldCallRecordingObjectNames(
        maps,
        new Set(['callRecordingOld', 'callRecordingsOld']),
      ),
    ).toEqual({
      nameSingular: 'callRecordingOld2',
      namePlural: 'callRecordingsOld2',
      labelSingular: 'Call Recording (Old) 2',
      labelPlural: 'Call Recordings (Old) 2',
    });
  });

  it('skips a discriminator when only the plural Old name is taken', () => {
    const maps = buildFlatObjectMetadataMaps([
      getFlatObjectMetadataMock({
        universalIdentifier: 'plural-old-taken',
        nameSingular: 'unrelatedSingular',
        namePlural: 'callRecordingsOld',
      }),
    ]);

    expect(resolveAvailableOldCallRecordingObjectNames(maps)).toEqual({
      nameSingular: 'callRecordingOld2',
      namePlural: 'callRecordingsOld2',
      labelSingular: 'Call Recording (Old) 2',
      labelPlural: 'Call Recordings (Old) 2',
    });
  });

  it('throws when every candidate Old name is taken', () => {
    const blockedSingularNames = Array.from({ length: 100 }, (_, attempt) => {
      const discriminator = attempt === 0 ? '' : `${attempt + 1}`;

      return `callRecordingOld${discriminator}`;
    });

    const maps = buildFlatObjectMetadataMaps(
      blockedSingularNames.map((nameSingular, index) =>
        getFlatObjectMetadataMock({
          universalIdentifier: `taken-${index}`,
          nameSingular,
          namePlural: `${nameSingular}Filler`,
        }),
      ),
    );

    expect(() => resolveAvailableOldCallRecordingObjectNames(maps)).toThrow(
      'Could not find an available callRecordingOld name after 100 attempts',
    );
  });
});

describe('buildCallRecordingObjectRenameUpdates', () => {
  it('builds a migration update for a colliding object name', () => {
    const maps = buildFlatObjectMetadataMaps([
      getFlatObjectMetadataMock({
        universalIdentifier: 'colliding',
        nameSingular: 'callRecording',
        namePlural: 'callRecordings',
      }),
    ]);

    expect(
      buildCallRecordingObjectRenameUpdates({
        flatObjectMetadataMaps: maps,
        now: NOW,
      }),
    ).toMatchObject([
      {
        universalIdentifier: 'colliding',
        nameSingular: 'callRecordingOld',
        namePlural: 'callRecordingsOld',
        labelSingular: 'Call Recording (Old)',
        labelPlural: 'Call Recordings (Old)',
        isLabelSyncedWithName: false,
        updatedAt: NOW,
      },
    ]);
  });

  it('reserves generated names across multiple object updates', () => {
    const maps = buildFlatObjectMetadataMaps([
      getFlatObjectMetadataMock({
        universalIdentifier: 'colliding-singular',
        nameSingular: 'callRecording',
        namePlural: 'myRecordings',
      }),
      getFlatObjectMetadataMock({
        universalIdentifier: 'colliding-plural',
        nameSingular: 'myRecording',
        namePlural: 'callRecordings',
      }),
    ]);

    expect(
      buildCallRecordingObjectRenameUpdates({
        flatObjectMetadataMaps: maps,
        now: NOW,
      }).map((objectMetadata) => objectMetadata.nameSingular),
    ).toEqual(['callRecordingOld', 'callRecordingOld2']);
  });
});

describe('findCalendarEventFieldNameCollisionsForCallRecording', () => {
  it('finds calendarEvent fields that use a name reserved by CallRecording', () => {
    const maps = buildFlatFieldMetadataMaps([
      getCalendarEventFieldMetadataMock({
        universalIdentifier: 'colliding-recording-preference',
        name: 'recordingPreference',
        label: 'Recording Preference',
      }),
      getCalendarEventFieldMetadataMock({
        universalIdentifier: 'colliding-call-recordings',
        name: 'callRecordings',
        label: 'Call Recordings',
      }),
    ]);

    expect(
      findCalendarEventFieldNameCollisionsForCallRecording(maps).map(
        (fieldMetadata) => fieldMetadata.universalIdentifier,
      ),
    ).toEqual(['colliding-recording-preference', 'colliding-call-recordings']);
  });

  it('excludes the CallRecording standard calendarEvent fields', () => {
    const maps = buildFlatFieldMetadataMaps([
      getCalendarEventFieldMetadataMock({
        universalIdentifier:
          LEGACY_CALENDAR_EVENT_RECORDING_PREFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
        name: 'recordingPreference',
      }),
      getCalendarEventFieldMetadataMock({
        universalIdentifier:
          STANDARD_OBJECTS.calendarEvent.fields.callRecordings
            .universalIdentifier,
        name: 'callRecordings',
      }),
    ]);

    expect(findCalendarEventFieldNameCollisionsForCallRecording(maps)).toEqual(
      [],
    );
  });

  it('excludes fields on objects other than calendarEvent', () => {
    const maps = buildFlatFieldMetadataMaps([
      getFlatFieldMetadataMock({
        universalIdentifier: 'other-object-field',
        objectMetadataId: 'other-object-id',
        objectMetadataUniversalIdentifier: 'other-object',
        type: FieldMetadataType.TEXT,
        name: 'recordingPreference',
        label: 'Recording Preference',
      }),
    ]);

    expect(findCalendarEventFieldNameCollisionsForCallRecording(maps)).toEqual(
      [],
    );
  });
});

describe('resolveAvailableOldCalendarEventFieldName', () => {
  it('returns the unsuffixed Old field name when it is available', () => {
    const maps = buildFlatFieldMetadataMaps([
      getCalendarEventFieldMetadataMock({
        universalIdentifier: 'colliding-field',
        name: 'recordingPreference',
      }),
    ]);

    expect(
      resolveAvailableOldCalendarEventFieldName({
        flatFieldMetadataMaps: maps,
        originalFieldName: 'recordingPreference',
      }),
    ).toBe('recordingPreferenceOld');
  });

  it('advances to the next discriminator when the Old field name is taken', () => {
    const maps = buildFlatFieldMetadataMaps([
      getCalendarEventFieldMetadataMock({
        universalIdentifier: 'colliding-field',
        name: 'recordingPreference',
      }),
      getCalendarEventFieldMetadataMock({
        universalIdentifier: 'old-field-name-taken',
        name: 'recordingPreferenceOld',
      }),
    ]);

    expect(
      resolveAvailableOldCalendarEventFieldName({
        flatFieldMetadataMaps: maps,
        originalFieldName: 'recordingPreference',
      }),
    ).toBe('recordingPreferenceOld2');
  });

  it('skips Old field names provided as already reserved', () => {
    const maps = buildFlatFieldMetadataMaps([
      getCalendarEventFieldMetadataMock({
        universalIdentifier: 'colliding-field',
        name: 'callRecordings',
      }),
    ]);

    expect(
      resolveAvailableOldCalendarEventFieldName({
        flatFieldMetadataMaps: maps,
        originalFieldName: 'callRecordings',
        additionalTakenNames: new Set(['callRecordingsOld']),
      }),
    ).toBe('callRecordingsOld2');
  });
});

describe('buildCalendarEventFieldRenameUpdates', () => {
  it('builds a migration update for a colliding calendarEvent field name', () => {
    const maps = buildFlatFieldMetadataMaps([
      getCalendarEventFieldMetadataMock({
        universalIdentifier: 'colliding-field',
        name: 'recordingPreference',
        label: 'Recording Preference',
      }),
    ]);

    expect(
      buildCalendarEventFieldRenameUpdates({
        flatFieldMetadataMaps: maps,
        now: NOW,
      }),
    ).toMatchObject([
      {
        universalIdentifier: 'colliding-field',
        name: 'recordingPreferenceOld',
        label: 'Recording Preference (Old)',
        isLabelSyncedWithName: false,
        updatedAt: NOW,
      },
    ]);
  });

  it('reserves generated names across multiple field updates', () => {
    const maps = buildFlatFieldMetadataMaps([
      getCalendarEventFieldMetadataMock({
        universalIdentifier: 'colliding-field-one',
        name: 'recordingPreference',
        label: 'Recording Preference',
      }),
      getCalendarEventFieldMetadataMock({
        universalIdentifier: 'colliding-field-two',
        name: 'recordingPreference',
        label: 'Recording Preference',
      }),
    ]);

    expect(
      buildCalendarEventFieldRenameUpdates({
        flatFieldMetadataMaps: maps,
        now: NOW,
      }).map((fieldMetadata) => fieldMetadata.name),
    ).toEqual(['recordingPreferenceOld', 'recordingPreferenceOld2']);
  });
});
