import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-9/utils/get-standard-flat-entities-to-create-or-throw.util';
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

describe('getStandardFlatEntitiesToCreateOrThrow', () => {
  it('returns the standard entity when it is absent from the existing maps', () => {
    const standardEntity = getFlatObjectMetadataMock({
      universalIdentifier: 'call-recording',
      nameSingular: 'callRecording',
      namePlural: 'callRecordings',
    });
    const standardFlatEntityMaps = buildFlatObjectMetadataMaps([standardEntity]);
    const existingFlatEntityMaps = buildFlatObjectMetadataMaps([]);

    expect(
      getStandardFlatEntitiesToCreateOrThrow<FlatObjectMetadata>({
        standardFlatEntityMaps,
        existingFlatEntityMaps,
        universalIdentifiers: ['call-recording'],
      }),
    ).toEqual([standardEntity]);
  });

  it('skips an entity that already exists in the existing maps (idempotent re-run)', () => {
    const standardEntity = getFlatObjectMetadataMock({
      universalIdentifier: 'call-recording',
      nameSingular: 'callRecording',
      namePlural: 'callRecordings',
    });
    const standardFlatEntityMaps = buildFlatObjectMetadataMaps([standardEntity]);
    const existingFlatEntityMaps = buildFlatObjectMetadataMaps([standardEntity]);

    expect(
      getStandardFlatEntitiesToCreateOrThrow<FlatObjectMetadata>({
        standardFlatEntityMaps,
        existingFlatEntityMaps,
        universalIdentifiers: ['call-recording'],
      }),
    ).toEqual([]);
  });

  it('returns only the entities missing from the existing maps', () => {
    const existingEntity = getFlatObjectMetadataMock({
      universalIdentifier: 'already-synced',
      nameSingular: 'alreadySynced',
      namePlural: 'alreadySynceds',
    });
    const missingEntity = getFlatObjectMetadataMock({
      universalIdentifier: 'not-yet-synced',
      nameSingular: 'notYetSynced',
      namePlural: 'notYetSynceds',
    });
    const standardFlatEntityMaps = buildFlatObjectMetadataMaps([
      existingEntity,
      missingEntity,
    ]);
    const existingFlatEntityMaps = buildFlatObjectMetadataMaps([existingEntity]);

    expect(
      getStandardFlatEntitiesToCreateOrThrow<FlatObjectMetadata>({
        standardFlatEntityMaps,
        existingFlatEntityMaps,
        universalIdentifiers: ['already-synced', 'not-yet-synced'],
      }),
    ).toEqual([missingEntity]);
  });

  it('returns an empty array when no universal identifiers are requested', () => {
    const standardFlatEntityMaps = buildFlatObjectMetadataMaps([
      getFlatObjectMetadataMock({
        universalIdentifier: 'call-recording',
        nameSingular: 'callRecording',
        namePlural: 'callRecordings',
      }),
    ]);

    expect(
      getStandardFlatEntitiesToCreateOrThrow<FlatObjectMetadata>({
        standardFlatEntityMaps,
        existingFlatEntityMaps: buildFlatObjectMetadataMaps([]),
        universalIdentifiers: [],
      }),
    ).toEqual([]);
  });

  it('throws when a requested identifier is missing from the standard maps', () => {
    expect(() =>
      getStandardFlatEntitiesToCreateOrThrow<FlatObjectMetadata>({
        standardFlatEntityMaps: buildFlatObjectMetadataMaps([]),
        existingFlatEntityMaps: buildFlatObjectMetadataMaps([]),
        universalIdentifiers: ['missing-from-standard'],
      }),
    ).toThrow('Could not find standard entity missing-from-standard');
  });
});
