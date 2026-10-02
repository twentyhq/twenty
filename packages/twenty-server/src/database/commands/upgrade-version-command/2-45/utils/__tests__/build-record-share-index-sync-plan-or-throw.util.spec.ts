import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { v4 } from 'uuid';

import {
  LEGACY_RECORD_SHARE_INDEXES,
  PRINCIPAL_ID_OBJECT_METADATA_ID_INDEX,
  buildRecordShareIndexSyncPlanOrThrow,
} from 'src/database/commands/upgrade-version-command/2-45/utils/build-record-share-index-sync-plan-or-throw.util';
import { FlatEntityMapsException } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-01-01T00:00:00.000Z';

const { allFlatEntityMaps: standardAllFlatEntityMaps } =
  computeTwentyStandardApplicationAllFlatEntityMaps({
    now: NOW,
    workspaceId: v4(),
    twentyStandardApplicationId: v4(),
  });

const recordShareFlatObjectMetadata = findFlatEntityByUniversalIdentifierOrThrow(
  {
    flatEntityMaps: standardAllFlatEntityMaps.flatObjectMetadataMaps,
    universalIdentifier: STANDARD_OBJECTS.recordShare.universalIdentifier,
  },
);

const standardFlatIndexMetadata = findFlatEntityByUniversalIdentifierOrThrow({
  flatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
  universalIdentifier:
    PRINCIPAL_ID_OBJECT_METADATA_ID_INDEX.universalIdentifier,
});

const buildFlatIndexMaps = (
  universalIdentifiers: string[],
): Pick<FlatEntityMaps<FlatIndexMetadata>, 'byUniversalIdentifier'> => ({
  byUniversalIdentifier: Object.fromEntries(
    universalIdentifiers.map((universalIdentifier) => [
      universalIdentifier,
      {
        ...standardFlatIndexMetadata,
        universalIdentifier,
        name: `IDX_${universalIdentifier}`,
      },
    ]),
  ),
});

const buildPlan = (
  direction: 'up' | 'down',
  existingIndexUniversalIdentifiers: string[],
) =>
  buildRecordShareIndexSyncPlanOrThrow({
    recordShareFlatObjectMetadata,
    flatFieldMetadataMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
    flatIndexMaps: buildFlatIndexMaps(existingIndexUniversalIdentifiers),
    direction,
    now: NOW,
  });

const LEGACY_INDEX_UNIVERSAL_IDENTIFIERS = LEGACY_RECORD_SHARE_INDEXES.map(
  ({ universalIdentifier }) => universalIdentifier,
);

describe('buildRecordShareIndexSyncPlanOrThrow', () => {
  it('should replace the legacy indexes with the one a new workspace gets', () => {
    const { indexesToCreate, indexesToDelete } = buildPlan(
      'up',
      LEGACY_INDEX_UNIVERSAL_IDENTIFIERS,
    );

    expect(indexesToCreate).toHaveLength(1);
    expect(indexesToCreate[0].columnNames).toEqual([
      'principalId',
      'objectMetadataId',
    ]);
    expect(indexesToCreate[0].universalFlatIndexMetadata).toMatchObject({
      universalIdentifier: standardFlatIndexMetadata.universalIdentifier,
      name: standardFlatIndexMetadata.name,
      isUnique: false,
      indexWhereClause: null,
    });
    expect(
      indexesToCreate[0].universalFlatIndexMetadata.universalFlatIndexFieldMetadatas.map(
        ({ fieldMetadataUniversalIdentifier, order }) => [
          fieldMetadataUniversalIdentifier,
          order,
        ],
      ),
    ).toEqual([
      [STANDARD_OBJECTS.recordShare.fields.principalId.universalIdentifier, 0],
      [
        STANDARD_OBJECTS.recordShare.fields.objectMetadataId
          .universalIdentifier,
        1,
      ],
    ]);
    expect(
      indexesToDelete.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual(LEGACY_INDEX_UNIVERSAL_IDENTIFIERS);
  });

  it('should leave a workspace already on the new index untouched', () => {
    expect(
      buildPlan('up', [PRINCIPAL_ID_OBJECT_METADATA_ID_INDEX.universalIdentifier]),
    ).toEqual({ indexesToCreate: [], indexesToDelete: [] });
  });

  it('should only create what a partially migrated workspace lacks', () => {
    const { indexesToCreate, indexesToDelete } = buildPlan('up', [
      PRINCIPAL_ID_OBJECT_METADATA_ID_INDEX.universalIdentifier,
      LEGACY_INDEX_UNIVERSAL_IDENTIFIERS[1],
    ]);

    expect(indexesToCreate).toEqual([]);
    expect(
      indexesToDelete.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual([LEGACY_INDEX_UNIVERSAL_IDENTIFIERS[1]]);
  });

  it('should restore the principalId and sourceId indexes on the way down', () => {
    const { indexesToCreate, indexesToDelete } = buildPlan('down', [
      PRINCIPAL_ID_OBJECT_METADATA_ID_INDEX.universalIdentifier,
    ]);

    expect(
      indexesToCreate.map(({ universalFlatIndexMetadata, columnNames }) => [
        universalFlatIndexMetadata.universalIdentifier,
        columnNames,
      ]),
    ).toEqual([
      [LEGACY_INDEX_UNIVERSAL_IDENTIFIERS[0], ['principalId']],
      [LEGACY_INDEX_UNIVERSAL_IDENTIFIERS[1], ['sourceId']],
    ]);
    expect(
      indexesToDelete.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual([PRINCIPAL_ID_OBJECT_METADATA_ID_INDEX.universalIdentifier]);
  });

  it('should throw when a recordShare field to index is missing', () => {
    expect(() =>
      buildRecordShareIndexSyncPlanOrThrow({
        recordShareFlatObjectMetadata,
        flatFieldMetadataMaps: {
          byUniversalIdentifier: {},
          universalIdentifierById: {},
          universalIdentifiersByApplicationId: {},
        },
        flatIndexMaps: buildFlatIndexMaps(LEGACY_INDEX_UNIVERSAL_IDENTIFIERS),
        direction: 'up',
        now: NOW,
      }),
    ).toThrow(FlatEntityMapsException);
  });
});
