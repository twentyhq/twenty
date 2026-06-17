import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { buildSearchFieldMetadataBackfillOperations } from 'src/database/commands/upgrade-version-command/2-15/utils/build-search-field-metadata-backfill-operations.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  getFlatObjectMetadataMock,
  getStandardFlatObjectMetadataMock,
} from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';

const CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER = 'custom-application-uid';

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

const buildSearchFieldMetadata = ({
  id,
  universalIdentifier,
  objectMetadataId,
  fieldMetadataId,
  objectMetadataUniversalIdentifier,
  fieldMetadataUniversalIdentifier,
  applicationUniversalIdentifier,
}: {
  id: string;
  universalIdentifier: string;
  objectMetadataId: string;
  fieldMetadataId: string;
  objectMetadataUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
}): FlatSearchFieldMetadata => {
  const createdAt = '2024-01-01T00:00:00.000Z';

  return {
    id,
    universalIdentifier,
    objectMetadataId,
    fieldMetadataId,
    objectMetadataUniversalIdentifier,
    fieldMetadataUniversalIdentifier,
    applicationId: 'unused-application-id',
    applicationUniversalIdentifier,
    workspaceId: 'workspace-id',
    createdAt,
    updatedAt: createdAt,
  };
};

// Custom object with two TEXT fields whose names overlap by prefix (tag / tagline).
// The label identifier is the `tag` field. Only the `tag` field should produce a row;
// the deterministic id-based selection makes the prefix overlap irrelevant.
const buildCustomObjectFixture = () => {
  const tagFieldId = 'tag-field-id';
  const taglineFieldId = 'tagline-field-id';
  const customObjectUniversalIdentifier = 'custom-object-uid';
  const customObjectId = 'custom-object-id';

  const tagField = getFlatFieldMetadataMock({
    id: tagFieldId,
    universalIdentifier: 'tag-field-uid',
    objectMetadataId: customObjectId,
    objectMetadataUniversalIdentifier: customObjectUniversalIdentifier,
    type: FieldMetadataType.TEXT,
    name: 'tag',
    applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  });

  const taglineField = getFlatFieldMetadataMock({
    id: taglineFieldId,
    universalIdentifier: 'tagline-field-uid',
    objectMetadataId: customObjectId,
    objectMetadataUniversalIdentifier: customObjectUniversalIdentifier,
    type: FieldMetadataType.TEXT,
    name: 'tagline',
    applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  });

  const customObject = getFlatObjectMetadataMock({
    id: customObjectId,
    universalIdentifier: customObjectUniversalIdentifier,
    isSearchable: true,
    isCustom: true,
    applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    labelIdentifierFieldMetadataId: tagFieldId,
    fieldIds: [tagFieldId, taglineFieldId],
  });

  return { customObject, tagField, taglineField };
};

describe('buildSearchFieldMetadataBackfillOperations', () => {
  it('selects only the label-identifier field for a custom object, ignoring a prefix-overlapping field name', () => {
    const { customObject, tagField, taglineField } =
      buildCustomObjectFixture();

    const { flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier } =
      buildSearchFieldMetadataBackfillOperations({
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([customObject]),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          tagField,
          taglineField,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([]),
        standardFlatSearchFieldMetadataMaps:
          buildFlatSearchFieldMetadataMaps([]),
      });

    const customApplicationRows =
      flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier[
        CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER
      ];

    expect(customApplicationRows).toHaveLength(1);
    expect(customApplicationRows?.[0].fieldMetadataUniversalIdentifier).toBe(
      tagField.universalIdentifier,
    );
    expect(customApplicationRows?.[0].objectMetadataUniversalIdentifier).toBe(
      customObject.universalIdentifier,
    );
    // No spurious row for the prefix-overlapping `tagline` field.
    expect(
      customApplicationRows?.some(
        (row) =>
          row.fieldMetadataUniversalIdentifier ===
          taglineField.universalIdentifier,
      ),
    ).toBe(false);
  });

  it('groups rows per application: standard-object rows under the standard application, custom-object rows under the custom application', () => {
    const { customObject, tagField, taglineField } =
      buildCustomObjectFixture();

    const standardObjectId = 'standard-object-id';
    const standardObjectUniversalIdentifier = 'standard-object-uid';
    const standardFieldId = 'standard-field-id';
    const standardFieldUniversalIdentifier = 'standard-field-uid';

    const standardField = getFlatFieldMetadataMock({
      id: standardFieldId,
      universalIdentifier: standardFieldUniversalIdentifier,
      objectMetadataId: standardObjectId,
      objectMetadataUniversalIdentifier: standardObjectUniversalIdentifier,
      type: FieldMetadataType.TEXT,
      name: 'name',
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    const standardObject = getStandardFlatObjectMetadataMock({
      id: standardObjectId,
      universalIdentifier: standardObjectUniversalIdentifier,
      isSearchable: true,
      labelIdentifierFieldMetadataId: standardFieldId,
      fieldIds: [standardFieldId],
    });

    const standardSearchFieldMetadata = buildSearchFieldMetadata({
      id: 'standard-search-field-id',
      universalIdentifier: 'standard-search-field-uid',
      objectMetadataId: standardObjectId,
      fieldMetadataId: standardFieldId,
      objectMetadataUniversalIdentifier: standardObjectUniversalIdentifier,
      fieldMetadataUniversalIdentifier: standardFieldUniversalIdentifier,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    const { flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier } =
      buildSearchFieldMetadataBackfillOperations({
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([
          customObject,
          standardObject,
        ]),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          tagField,
          taglineField,
          standardField,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([]),
        standardFlatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([
          standardSearchFieldMetadata,
        ]),
      });

    expect(
      Object.keys(
        flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
      ).sort(),
    ).toEqual(
      [
        CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      ].sort(),
    );

    const standardApplicationRows =
      flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier[
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
      ];

    expect(standardApplicationRows).toHaveLength(1);
    expect(standardApplicationRows?.[0].fieldMetadataUniversalIdentifier).toBe(
      standardFieldUniversalIdentifier,
    );

    const customApplicationRows =
      flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier[
        CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER
      ];

    expect(customApplicationRows).toHaveLength(1);
    expect(customApplicationRows?.[0].fieldMetadataUniversalIdentifier).toBe(
      tagField.universalIdentifier,
    );
  });

  it('is a no-op when the searchFieldMetadata rows already exist (idempotent)', () => {
    const { customObject, tagField, taglineField } =
      buildCustomObjectFixture();

    const existingSearchFieldMetadata = buildSearchFieldMetadata({
      id: 'existing-search-field-id',
      universalIdentifier: 'existing-search-field-uid',
      objectMetadataId: customObject.id,
      fieldMetadataId: tagField.id,
      objectMetadataUniversalIdentifier: customObject.universalIdentifier,
      fieldMetadataUniversalIdentifier: tagField.universalIdentifier,
      applicationUniversalIdentifier:
        CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    const { flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier } =
      buildSearchFieldMetadataBackfillOperations({
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([customObject]),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          tagField,
          taglineField,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([
          existingSearchFieldMetadata,
        ]),
        standardFlatSearchFieldMetadataMaps:
          buildFlatSearchFieldMetadataMaps([]),
      });

    expect(
      Object.keys(
        flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
      ),
    ).toHaveLength(0);
  });

  it('skips a custom object whose label-identifier field is not a searchable type', () => {
    const { customObject, tagField, taglineField } =
      buildCustomObjectFixture();

    const relationLabelIdentifierFieldId = 'relation-label-field-id';

    const relationLabelIdentifierField = getFlatFieldMetadataMock({
      id: relationLabelIdentifierFieldId,
      universalIdentifier: 'relation-label-field-uid',
      objectMetadataId: customObject.id,
      objectMetadataUniversalIdentifier: customObject.universalIdentifier,
      type: FieldMetadataType.RELATION,
      name: 'relationLabel',
      applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    const customObjectWithRelationLabelIdentifier: FlatObjectMetadata = {
      ...customObject,
      labelIdentifierFieldMetadataId: relationLabelIdentifierFieldId,
    };

    const { flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier } =
      buildSearchFieldMetadataBackfillOperations({
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([
          customObjectWithRelationLabelIdentifier,
        ]),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          tagField,
          taglineField,
          relationLabelIdentifierField,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([]),
        standardFlatSearchFieldMetadataMaps:
          buildFlatSearchFieldMetadataMaps([]),
      });

    expect(
      Object.keys(
        flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
      ),
    ).toHaveLength(0);
  });

  it('skips non-searchable objects', () => {
    const { customObject, tagField, taglineField } =
      buildCustomObjectFixture();

    const nonSearchableObject: FlatObjectMetadata = {
      ...customObject,
      isSearchable: false,
    };

    const { flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier } =
      buildSearchFieldMetadataBackfillOperations({
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([
          nonSearchableObject,
        ]),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          tagField,
          taglineField,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([]),
        standardFlatSearchFieldMetadataMaps:
          buildFlatSearchFieldMetadataMaps([]),
      });

    expect(
      Object.keys(
        flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
      ),
    ).toHaveLength(0);
  });
});
