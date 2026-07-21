import { getSearchFieldUniversalIdentifier } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { buildSearchFieldMetadataReOwnOperations } from 'src/database/commands/upgrade-version-command/2-20/utils/build-search-field-metadata-re-own-operations.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';

const STANDARD_APPLICATION_ID = 'standard-application-id';
// Application universal identifiers must be valid UUIDs: they are used as the v5
// namespace by the deterministic identifier helpers.
const STANDARD_APPLICATION_UID = '11111111-1111-4111-8111-111111111111';

const applicationUniversalIdentifierById = new Map([
  [STANDARD_APPLICATION_ID, STANDARD_APPLICATION_UID],
]);

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

const buildFlatSearchFieldMetadataMaps = (
  flatSearchFieldMetadatas: FlatSearchFieldMetadata[],
): FlatEntityMaps<FlatSearchFieldMetadata> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatSearchFieldMetadatas.map((flatSearchFieldMetadata) => [
      flatSearchFieldMetadata.universalIdentifier,
      flatSearchFieldMetadata,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatSearchFieldMetadatas.map((flatSearchFieldMetadata) => [
      flatSearchFieldMetadata.id,
      flatSearchFieldMetadata.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildFlatSearchFieldMetadata = ({
  id,
  universalIdentifier,
  objectMetadataId,
  fieldMetadataId,
}: {
  id: string;
  universalIdentifier: string;
  objectMetadataId: string;
  fieldMetadataId: string;
}): FlatSearchFieldMetadata => {
  const createdAt = '2024-01-01T00:00:00.000Z';

  return {
    id,
    universalIdentifier,
    objectMetadataId,
    fieldMetadataId,
    objectMetadataUniversalIdentifier: `${objectMetadataId}-uid`,
    fieldMetadataUniversalIdentifier: `${fieldMetadataId}-uid`,
    tsVectorFieldMetadataId: `${objectMetadataId}-search-vector-field-id`,
    tsVectorFieldMetadataUniversalIdentifier: `${objectMetadataId}-search-vector-field-uid`,
    applicationId: STANDARD_APPLICATION_ID,
    applicationUniversalIdentifier: STANDARD_APPLICATION_UID,
    position: 0,
    isSystemSideEffect: true,
    workspaceId: 'workspace-id',
    createdAt,
    updatedAt: createdAt,
  };
};

const nameFlatFieldMetadata = getFlatFieldMetadataMock({
  id: 'standard-object-name-field-id',
  universalIdentifier: 'standard-object-name-field-uid',
  objectMetadataId: 'standard-object-id',
  objectMetadataUniversalIdentifier: 'standard-object-uid',
  type: FieldMetadataType.TEXT,
  name: 'name',
  applicationId: STANDARD_APPLICATION_ID,
  applicationUniversalIdentifier: STANDARD_APPLICATION_UID,
});

describe('buildSearchFieldMetadataReOwnOperations', () => {
  it('re-owns an existing searchFieldMetadata carrying a non-deterministic universal identifier (all applications)', () => {
    const existingSearchFieldMetadata = buildFlatSearchFieldMetadata({
      id: 'existing-search-field-metadata-id',
      universalIdentifier: 'legacy-v4-search-field-metadata-uid',
      objectMetadataId: 'standard-object-id',
      fieldMetadataId: nameFlatFieldMetadata.id,
    });

    const searchFieldMetadataUniversalIdentifierUpdates =
      buildSearchFieldMetadataReOwnOperations({
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          nameFlatFieldMetadata,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([
          existingSearchFieldMetadata,
        ]),
        applicationUniversalIdentifierById,
      });

    expect(searchFieldMetadataUniversalIdentifierUpdates).toEqual([
      {
        id: existingSearchFieldMetadata.id,
        deterministicUniversalIdentifier: getSearchFieldUniversalIdentifier({
          applicationUniversalIdentifier: STANDARD_APPLICATION_UID,
          fieldMetadataUniversalIdentifier:
            nameFlatFieldMetadata.universalIdentifier,
        }),
      },
    ]);
  });

  it('is a no-op for a searchFieldMetadata already carrying its deterministic universal identifier', () => {
    const existingSearchFieldMetadata = buildFlatSearchFieldMetadata({
      id: 'existing-search-field-metadata-id',
      universalIdentifier: getSearchFieldUniversalIdentifier({
        applicationUniversalIdentifier: STANDARD_APPLICATION_UID,
        fieldMetadataUniversalIdentifier:
          nameFlatFieldMetadata.universalIdentifier,
      }),
      objectMetadataId: 'standard-object-id',
      fieldMetadataId: nameFlatFieldMetadata.id,
    });

    const searchFieldMetadataUniversalIdentifierUpdates =
      buildSearchFieldMetadataReOwnOperations({
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          nameFlatFieldMetadata,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([
          existingSearchFieldMetadata,
        ]),
        applicationUniversalIdentifierById,
      });

    expect(searchFieldMetadataUniversalIdentifierUpdates).toHaveLength(0);
  });
});
