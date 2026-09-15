import {
  getFieldUniversalIdentifier,
  getSearchFieldUniversalIdentifier,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { buildSearchFieldMetadataBackfillOperations } from 'src/database/commands/upgrade-version-command/2-20/utils/build-search-field-metadata-backfill-operations.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';

// Application universal identifiers must be valid UUIDs: they are used as the v5
// namespace by the deterministic identifier helpers.
const STANDARD_APPLICATION_ID = 'standard-application-id';
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
  applicationId,
  applicationUniversalIdentifier,
}: {
  id: string;
  universalIdentifier: string;
  objectMetadataId: string;
  fieldMetadataId: string;
  applicationId: string;
  applicationUniversalIdentifier: string;
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
    applicationId,
    applicationUniversalIdentifier,
    position: 0,
    isSystemSideEffect: true,
    workspaceId: 'workspace-id',
    createdAt,
    updatedAt: createdAt,
  };
};

const buildSearchableObjectFixture = ({
  objectId,
  objectUniversalIdentifier,
  applicationId,
  applicationUniversalIdentifier,
  labelIdentifierFieldType = FieldMetadataType.TEXT,
}: {
  objectId: string;
  objectUniversalIdentifier: string;
  applicationId: string;
  applicationUniversalIdentifier: string;
  labelIdentifierFieldType?: FieldMetadataType;
}) => {
  const nameFlatFieldMetadata = getFlatFieldMetadataMock({
    id: `${objectId}-name-field-id`,
    universalIdentifier: `${objectUniversalIdentifier}-name-field-uid`,
    objectMetadataId: objectId,
    objectMetadataUniversalIdentifier: objectUniversalIdentifier,
    type: labelIdentifierFieldType,
    name: 'name',
    applicationId,
    applicationUniversalIdentifier,
  });

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
    labelIdentifierFieldMetadataId: nameFlatFieldMetadata.id,
    labelIdentifierFieldMetadataUniversalIdentifier:
      nameFlatFieldMetadata.universalIdentifier,
    fieldUniversalIdentifiers: [
      nameFlatFieldMetadata.universalIdentifier,
      searchVectorFlatFieldMetadata.universalIdentifier,
    ],
  });

  return {
    flatObjectMetadata,
    nameFlatFieldMetadata,
    searchVectorFlatFieldMetadata,
  };
};

describe('buildSearchFieldMetadataBackfillOperations', () => {
  it('creates the searchFieldMetadata row for an installed-app searchable object that has none, grouped under its application', () => {
    const {
      flatObjectMetadata,
      nameFlatFieldMetadata,
      searchVectorFlatFieldMetadata,
    } = buildSearchableObjectFixture({
      objectId: 'installed-object-id',
      objectUniversalIdentifier: 'installed-object-uid',
      applicationId: INSTALLED_APPLICATION_ID,
      applicationUniversalIdentifier: INSTALLED_APPLICATION_UID,
    });

    const flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier =
      buildSearchFieldMetadataBackfillOperations({
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([
          flatObjectMetadata,
        ]),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          nameFlatFieldMetadata,
          searchVectorFlatFieldMetadata,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([]),
        applicationUniversalIdentifierById,
        twentyStandardApplicationId: STANDARD_APPLICATION_ID,
        workspaceCustomApplicationId: CUSTOM_APPLICATION_ID,
      });

    const createdRows =
      flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier[
        INSTALLED_APPLICATION_UID
      ];

    expect(createdRows).toHaveLength(1);
    expect(createdRows?.[0].fieldMetadataUniversalIdentifier).toBe(
      nameFlatFieldMetadata.universalIdentifier,
    );
    expect(createdRows?.[0].objectMetadataUniversalIdentifier).toBe(
      flatObjectMetadata.universalIdentifier,
    );
    expect(createdRows?.[0].tsVectorFieldMetadataUniversalIdentifier).toBe(
      searchVectorFlatFieldMetadata.universalIdentifier,
    );
    expect(createdRows?.[0].universalIdentifier).toBe(
      getSearchFieldUniversalIdentifier({
        applicationUniversalIdentifier: INSTALLED_APPLICATION_UID,
        fieldMetadataUniversalIdentifier:
          nameFlatFieldMetadata.universalIdentifier,
      }),
    );
  });

  it('does not create a row for an installed-app junction object whose label identifier is the UUID id field', () => {
    const {
      flatObjectMetadata,
      nameFlatFieldMetadata,
      searchVectorFlatFieldMetadata,
    } = buildSearchableObjectFixture({
      objectId: 'installed-junction-object-id',
      objectUniversalIdentifier: 'installed-junction-object-uid',
      applicationId: INSTALLED_APPLICATION_ID,
      applicationUniversalIdentifier: INSTALLED_APPLICATION_UID,
    });

    // The label identifier resolves to the derived `id` field: no search surface.
    const junctionObject: FlatObjectMetadata = {
      ...flatObjectMetadata,
      labelIdentifierFieldMetadataUniversalIdentifier:
        getFieldUniversalIdentifier({
          applicationUniversalIdentifier: INSTALLED_APPLICATION_UID,
          objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
          name: 'id',
        }),
    };

    const flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier =
      buildSearchFieldMetadataBackfillOperations({
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([junctionObject]),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          nameFlatFieldMetadata,
          searchVectorFlatFieldMetadata,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([]),
        applicationUniversalIdentifierById,
        twentyStandardApplicationId: STANDARD_APPLICATION_ID,
        workspaceCustomApplicationId: CUSTOM_APPLICATION_ID,
      });

    expect(
      Object.keys(
        flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
      ),
    ).toHaveLength(0);
  });

  it('does not create a row for an installed-app object whose label identifier is a non-searchable type', () => {
    const {
      flatObjectMetadata,
      nameFlatFieldMetadata,
      searchVectorFlatFieldMetadata,
    } = buildSearchableObjectFixture({
      objectId: 'installed-relation-object-id',
      objectUniversalIdentifier: 'installed-relation-object-uid',
      applicationId: INSTALLED_APPLICATION_ID,
      applicationUniversalIdentifier: INSTALLED_APPLICATION_UID,
      labelIdentifierFieldType: FieldMetadataType.RELATION,
    });

    const flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier =
      buildSearchFieldMetadataBackfillOperations({
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([
          flatObjectMetadata,
        ]),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          nameFlatFieldMetadata,
          searchVectorFlatFieldMetadata,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([]),
        applicationUniversalIdentifierById,
        twentyStandardApplicationId: STANDARD_APPLICATION_ID,
        workspaceCustomApplicationId: CUSTOM_APPLICATION_ID,
      });

    expect(
      Object.keys(
        flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
      ),
    ).toHaveLength(0);
  });

  it('does not create a row for a twenty-standard searchable object that has none', () => {
    const {
      flatObjectMetadata,
      nameFlatFieldMetadata,
      searchVectorFlatFieldMetadata,
    } = buildSearchableObjectFixture({
      objectId: 'standard-object-id',
      objectUniversalIdentifier: 'standard-object-uid',
      applicationId: STANDARD_APPLICATION_ID,
      applicationUniversalIdentifier: STANDARD_APPLICATION_UID,
    });

    const flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier =
      buildSearchFieldMetadataBackfillOperations({
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([
          flatObjectMetadata,
        ]),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          nameFlatFieldMetadata,
          searchVectorFlatFieldMetadata,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([]),
        applicationUniversalIdentifierById,
        twentyStandardApplicationId: STANDARD_APPLICATION_ID,
        workspaceCustomApplicationId: CUSTOM_APPLICATION_ID,
      });

    expect(
      Object.keys(
        flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
      ),
    ).toHaveLength(0);
  });

  it('does not create a row for a workspace-custom searchable object that has none', () => {
    const {
      flatObjectMetadata,
      nameFlatFieldMetadata,
      searchVectorFlatFieldMetadata,
    } = buildSearchableObjectFixture({
      objectId: 'custom-object-id',
      objectUniversalIdentifier: 'custom-object-uid',
      applicationId: CUSTOM_APPLICATION_ID,
      applicationUniversalIdentifier: CUSTOM_APPLICATION_UID,
    });

    const flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier =
      buildSearchFieldMetadataBackfillOperations({
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([
          flatObjectMetadata,
        ]),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          nameFlatFieldMetadata,
          searchVectorFlatFieldMetadata,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([]),
        applicationUniversalIdentifierById,
        twentyStandardApplicationId: STANDARD_APPLICATION_ID,
        workspaceCustomApplicationId: CUSTOM_APPLICATION_ID,
      });

    expect(
      Object.keys(
        flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
      ),
    ).toHaveLength(0);
  });

  it('is idempotent: no create when the installed-app searchFieldMetadata row already exists', () => {
    const {
      flatObjectMetadata,
      nameFlatFieldMetadata,
      searchVectorFlatFieldMetadata,
    } = buildSearchableObjectFixture({
      objectId: 'installed-object-id',
      objectUniversalIdentifier: 'installed-object-uid',
      applicationId: INSTALLED_APPLICATION_ID,
      applicationUniversalIdentifier: INSTALLED_APPLICATION_UID,
    });

    const existingSearchFieldMetadata = buildFlatSearchFieldMetadata({
      id: 'existing-search-field-metadata-id',
      universalIdentifier: getSearchFieldUniversalIdentifier({
        applicationUniversalIdentifier: INSTALLED_APPLICATION_UID,
        fieldMetadataUniversalIdentifier:
          nameFlatFieldMetadata.universalIdentifier,
      }),
      objectMetadataId: flatObjectMetadata.id,
      fieldMetadataId: nameFlatFieldMetadata.id,
      applicationId: INSTALLED_APPLICATION_ID,
      applicationUniversalIdentifier: INSTALLED_APPLICATION_UID,
    });

    const flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier =
      buildSearchFieldMetadataBackfillOperations({
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([
          flatObjectMetadata,
        ]),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          nameFlatFieldMetadata,
          searchVectorFlatFieldMetadata,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([
          existingSearchFieldMetadata,
        ]),
        applicationUniversalIdentifierById,
        twentyStandardApplicationId: STANDARD_APPLICATION_ID,
        workspaceCustomApplicationId: CUSTOM_APPLICATION_ID,
      });

    expect(
      Object.keys(
        flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
      ),
    ).toHaveLength(0);
  });
});
