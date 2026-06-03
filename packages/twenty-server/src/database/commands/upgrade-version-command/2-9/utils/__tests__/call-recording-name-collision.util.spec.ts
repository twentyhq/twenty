import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import {
  findCollidingCustomCallRecordingObject,
  resolveAvailableOldNames,
} from 'src/database/commands/upgrade-version-command/2-9/utils/call-recording-name-collision.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

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

describe('findCollidingCustomCallRecordingObject', () => {
  it('returns undefined when no object uses the callRecording name', () => {
    const maps = buildFlatObjectMetadataMaps([
      getFlatObjectMetadataMock({
        universalIdentifier: 'unrelated-object',
        nameSingular: 'invoice',
        namePlural: 'invoices',
      }),
    ]);

    expect(findCollidingCustomCallRecordingObject(maps)).toBeUndefined();
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
      findCollidingCustomCallRecordingObject(maps)?.universalIdentifier,
    ).toBe('colliding-singular');
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
      findCollidingCustomCallRecordingObject(maps)?.universalIdentifier,
    ).toBe('colliding-plural');
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

    expect(findCollidingCustomCallRecordingObject(maps)).toBeUndefined();
  });
});

describe('resolveAvailableOldNames', () => {
  it('returns the unsuffixed Old names when none are taken', () => {
    const maps = buildFlatObjectMetadataMaps([
      getFlatObjectMetadataMock({
        universalIdentifier: 'colliding',
        nameSingular: 'callRecording',
        namePlural: 'callRecordings',
      }),
    ]);

    expect(resolveAvailableOldNames(maps)).toEqual({
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

    expect(resolveAvailableOldNames(maps)).toEqual({
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

    expect(resolveAvailableOldNames(maps)).toEqual({
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

    expect(() => resolveAvailableOldNames(maps)).toThrow(
      'Could not find an available callRecordingOld name after 100 attempts',
    );
  });
});
