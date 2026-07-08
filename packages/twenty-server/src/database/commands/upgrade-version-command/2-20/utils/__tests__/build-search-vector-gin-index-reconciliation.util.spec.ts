import { getIndexUniversalIdentifier } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { buildSearchVectorGinIndexReconciliation } from 'src/database/commands/upgrade-version-command/2-20/utils/build-search-vector-gin-index-reconciliation.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import {
  type FlatIndexFieldMetadata,
  type FlatIndexMetadata,
} from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';

const STANDARD_APPLICATION_ID = 'standard-application-id';
// Application universal identifiers must be valid UUIDs: they are used as the v5
// namespace by the deterministic identifier helpers.
const STANDARD_APPLICATION_UID = '11111111-1111-4111-8111-111111111111';
const CUSTOM_APPLICATION_ID = 'custom-application-id';
const CUSTOM_APPLICATION_UID = '22222222-2222-4222-8222-222222222222';
const INSTALLED_APPLICATION_ID = 'installed-application-id';
const INSTALLED_APPLICATION_UID = '33333333-3333-4333-8333-333333333333';

const applicationUniversalIdentifierById = new Map([
  [STANDARD_APPLICATION_ID, STANDARD_APPLICATION_UID],
  [CUSTOM_APPLICATION_ID, CUSTOM_APPLICATION_UID],
  [INSTALLED_APPLICATION_ID, INSTALLED_APPLICATION_UID],
]);
const installedApplicationIds = new Set([INSTALLED_APPLICATION_ID]);

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

const buildFlatIndexMaps = (
  flatIndexMetadatas: FlatIndexMetadata[],
): FlatEntityMaps<FlatIndexMetadata> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatIndexMetadatas.map((flatIndexMetadata) => [
      flatIndexMetadata.universalIdentifier,
      flatIndexMetadata,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatIndexMetadatas.map((flatIndexMetadata) => [
      flatIndexMetadata.id,
      flatIndexMetadata.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildFlatIndexFieldMetadata = ({
  fieldMetadataId,
}: {
  fieldMetadataId: string;
}): FlatIndexFieldMetadata => {
  const createdAt = '2024-01-01T00:00:00.000Z';

  return {
    id: `${fieldMetadataId}-index-field-id`,
    workspaceId: 'workspace-id',
    indexMetadataId: 'index-metadata-id',
    fieldMetadataId,
    order: 0,
    subFieldName: null,
    createdAt,
    updatedAt: createdAt,
  };
};

const buildSearchableObjectFixture = ({
  objectId,
  objectUniversalIdentifier,
  applicationId,
  applicationUniversalIdentifier,
}: {
  objectId: string;
  objectUniversalIdentifier: string;
  applicationId: string;
  applicationUniversalIdentifier: string;
}) => {
  const searchVectorFlatFieldMetadata = getFlatFieldMetadataMock({
    id: `${objectId}-search-vector-field-id`,
    universalIdentifier: `${objectUniversalIdentifier}-search-vector-field-uid`,
    objectMetadataId: objectId,
    objectMetadataUniversalIdentifier: objectUniversalIdentifier,
    type: FieldMetadataType.TS_VECTOR,
    name: SEARCH_VECTOR_FIELD.name,
    applicationId,
    applicationUniversalIdentifier,
  });

  const flatObjectMetadata = getFlatObjectMetadataMock({
    id: objectId,
    universalIdentifier: objectUniversalIdentifier,
    isSearchable: true,
    applicationId,
    applicationUniversalIdentifier,
    fieldUniversalIdentifiers: [
      searchVectorFlatFieldMetadata.universalIdentifier,
    ],
  });

  return { flatObjectMetadata, searchVectorFlatFieldMetadata };
};

describe('buildSearchVectorGinIndexReconciliation', () => {
  it('re-owns an existing GIN searchVector index carrying a non-deterministic universal identifier (all applications)', () => {
    const { flatObjectMetadata, searchVectorFlatFieldMetadata } =
      buildSearchableObjectFixture({
        objectId: 'standard-object-id',
        objectUniversalIdentifier: 'standard-object-uid',
        applicationId: STANDARD_APPLICATION_ID,
        applicationUniversalIdentifier: STANDARD_APPLICATION_UID,
      });

    const indexName = 'IDX_SEARCH_VECTOR_STANDARD';
    const ginIndex = getFlatIndexMetadataMock({
      id: 'standard-gin-index-id',
      universalIdentifier: 'legacy-v4-index-uid',
      objectMetadataId: flatObjectMetadata.id,
      objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      applicationId: STANDARD_APPLICATION_ID,
      applicationUniversalIdentifier: STANDARD_APPLICATION_UID,
      name: indexName,
      indexType: IndexType.GIN,
      flatIndexFieldMetadatas: [
        buildFlatIndexFieldMetadata({
          fieldMetadataId: searchVectorFlatFieldMetadata.id,
        }),
      ],
    });

    const {
      indexUniversalIdentifierUpdates,
      flatIndexesToCreateByApplicationUniversalIdentifier,
    } = buildSearchVectorGinIndexReconciliation({
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps([flatObjectMetadata]),
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
        searchVectorFlatFieldMetadata,
      ]),
      flatIndexMaps: buildFlatIndexMaps([ginIndex]),
      applicationUniversalIdentifierById,
      installedApplicationIds,
    });

    expect(indexUniversalIdentifierUpdates).toEqual([
      {
        id: ginIndex.id,
        name: indexName,
        deterministicUniversalIdentifier: getIndexUniversalIdentifier({
          applicationUniversalIdentifier: STANDARD_APPLICATION_UID,
          objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
          name: indexName,
        }),
      },
    ]);
    expect(
      Object.keys(flatIndexesToCreateByApplicationUniversalIdentifier),
    ).toHaveLength(0);
  });

  it('is a no-op for a GIN searchVector index already carrying its deterministic universal identifier', () => {
    const { flatObjectMetadata, searchVectorFlatFieldMetadata } =
      buildSearchableObjectFixture({
        objectId: 'standard-object-id',
        objectUniversalIdentifier: 'standard-object-uid',
        applicationId: STANDARD_APPLICATION_ID,
        applicationUniversalIdentifier: STANDARD_APPLICATION_UID,
      });

    const indexName = 'IDX_SEARCH_VECTOR_STANDARD';
    const ginIndex = getFlatIndexMetadataMock({
      id: 'standard-gin-index-id',
      universalIdentifier: getIndexUniversalIdentifier({
        applicationUniversalIdentifier: STANDARD_APPLICATION_UID,
        objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
        name: indexName,
      }),
      objectMetadataId: flatObjectMetadata.id,
      objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      applicationId: STANDARD_APPLICATION_ID,
      applicationUniversalIdentifier: STANDARD_APPLICATION_UID,
      name: indexName,
      indexType: IndexType.GIN,
      flatIndexFieldMetadatas: [
        buildFlatIndexFieldMetadata({
          fieldMetadataId: searchVectorFlatFieldMetadata.id,
        }),
      ],
    });

    const {
      indexUniversalIdentifierUpdates,
      flatIndexesToCreateByApplicationUniversalIdentifier,
    } = buildSearchVectorGinIndexReconciliation({
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps([flatObjectMetadata]),
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
        searchVectorFlatFieldMetadata,
      ]),
      flatIndexMaps: buildFlatIndexMaps([ginIndex]),
      applicationUniversalIdentifierById,
      installedApplicationIds,
    });

    expect(indexUniversalIdentifierUpdates).toHaveLength(0);
    expect(
      Object.keys(flatIndexesToCreateByApplicationUniversalIdentifier),
    ).toHaveLength(0);
  });

  it('creates a GIN searchVector index for an installed-app object that has none, grouped under its application', () => {
    const { flatObjectMetadata, searchVectorFlatFieldMetadata } =
      buildSearchableObjectFixture({
        objectId: 'installed-object-id',
        objectUniversalIdentifier: 'installed-object-uid',
        applicationId: INSTALLED_APPLICATION_ID,
        applicationUniversalIdentifier: INSTALLED_APPLICATION_UID,
      });

    const {
      indexUniversalIdentifierUpdates,
      flatIndexesToCreateByApplicationUniversalIdentifier,
    } = buildSearchVectorGinIndexReconciliation({
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps([flatObjectMetadata]),
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
        searchVectorFlatFieldMetadata,
      ]),
      flatIndexMaps: buildFlatIndexMaps([]),
      applicationUniversalIdentifierById,
      installedApplicationIds,
    });

    expect(indexUniversalIdentifierUpdates).toHaveLength(0);

    const createdIndexes =
      flatIndexesToCreateByApplicationUniversalIdentifier[
        INSTALLED_APPLICATION_UID
      ];

    expect(createdIndexes).toHaveLength(1);
    expect(createdIndexes?.[0].indexType).toBe(IndexType.GIN);
    expect(createdIndexes?.[0].objectMetadataUniversalIdentifier).toBe(
      flatObjectMetadata.universalIdentifier,
    );
    expect(createdIndexes?.[0].applicationUniversalIdentifier).toBe(
      INSTALLED_APPLICATION_UID,
    );
  });

  it('does not create an index for a non-installed (workspace-custom) object that has none', () => {
    const { flatObjectMetadata, searchVectorFlatFieldMetadata } =
      buildSearchableObjectFixture({
        objectId: 'custom-object-id',
        objectUniversalIdentifier: 'custom-object-uid',
        applicationId: CUSTOM_APPLICATION_ID,
        applicationUniversalIdentifier: CUSTOM_APPLICATION_UID,
      });

    const {
      indexUniversalIdentifierUpdates,
      flatIndexesToCreateByApplicationUniversalIdentifier,
    } = buildSearchVectorGinIndexReconciliation({
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps([flatObjectMetadata]),
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
        searchVectorFlatFieldMetadata,
      ]),
      flatIndexMaps: buildFlatIndexMaps([]),
      applicationUniversalIdentifierById,
      installedApplicationIds,
    });

    expect(indexUniversalIdentifierUpdates).toHaveLength(0);
    expect(
      Object.keys(flatIndexesToCreateByApplicationUniversalIdentifier),
    ).toHaveLength(0);
  });
});
