import {
  getSearchFieldUniversalIdentifier,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { buildSearchFieldMetadataBackfillOperations } from 'src/database/commands/upgrade-version-command/2-16/utils/build-search-field-metadata-backfill-operations.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  getFlatObjectMetadataMock,
  getStandardFlatObjectMetadataMock,
} from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';

const CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  'c0c1c2c3-c4c5-4000-8000-000000000001';
const CUSTOM_APPLICATION_ID = 'custom-application-id';

const buildUniversalIdentifiersByApplicationId = (
  flatObjectMetadatas: FlatObjectMetadata[],
): Record<string, string[]> =>
  flatObjectMetadatas.reduce<Record<string, string[]>>(
    (universalIdentifiersByApplicationId, flatObjectMetadata) => {
      const applicationUniversalIdentifiers =
        universalIdentifiersByApplicationId[flatObjectMetadata.applicationId] ??
        [];

      applicationUniversalIdentifiers.push(
        flatObjectMetadata.universalIdentifier,
      );

      universalIdentifiersByApplicationId[flatObjectMetadata.applicationId] =
        applicationUniversalIdentifiers;

      return universalIdentifiersByApplicationId;
    },
    {},
  );

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
  universalIdentifiersByApplicationId:
    buildUniversalIdentifiersByApplicationId(flatObjectMetadatas),
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
  position = 0,
  tsVectorFieldMetadataId = 'ts-vector-field-metadata-id',
  tsVectorFieldMetadataUniversalIdentifier = 'ts-vector-field-metadata-universal-identifier',
}: {
  id: string;
  universalIdentifier: string;
  objectMetadataId: string;
  fieldMetadataId: string;
  objectMetadataUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  position?: number;
  tsVectorFieldMetadataId?: string;
  tsVectorFieldMetadataUniversalIdentifier?: string;
}): FlatSearchFieldMetadata => {
  const createdAt = '2024-01-01T00:00:00.000Z';

  return {
    id,
    universalIdentifier,
    objectMetadataId,
    fieldMetadataId,
    objectMetadataUniversalIdentifier,
    fieldMetadataUniversalIdentifier,
    tsVectorFieldMetadataId,
    tsVectorFieldMetadataUniversalIdentifier,
    applicationId: 'unused-application-id',
    applicationUniversalIdentifier,
    position,
    isSystemSideEffect: true,
    workspaceId: 'workspace-id',
    createdAt,
    updatedAt: createdAt,
  };
};

const buildSearchVectorField = ({
  objectMetadataId,
  objectMetadataUniversalIdentifier,
  applicationUniversalIdentifier,
}: {
  objectMetadataId: string;
  objectMetadataUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
}): FlatFieldMetadata =>
  getFlatFieldMetadataMock({
    id: `${objectMetadataId}-search-vector-field-id`,
    universalIdentifier: `${objectMetadataUniversalIdentifier}-search-vector-field-uid`,
    objectMetadataId,
    objectMetadataUniversalIdentifier,
    type: FieldMetadataType.TS_VECTOR,
    name: SEARCH_VECTOR_FIELD.name,
    applicationUniversalIdentifier,
  });

// Custom object with a searchable `name` field plus a TEXT field whose name
// overlaps it by prefix (name / nameDescription). Only the `name` field should
// produce a row; the exact-name match makes the prefix overlap irrelevant. This
// mirrors pre-2.15 provisioning, which indexes the custom object's `name` field only.
const buildCustomObjectFixture = () => {
  const nameFieldId = 'name-field-id';
  const nameDescriptionFieldId = 'name-description-field-id';
  const customObjectUniversalIdentifier = 'custom-object-uid';
  const customObjectId = 'custom-object-id';

  const nameField = getFlatFieldMetadataMock({
    id: nameFieldId,
    universalIdentifier: 'name-field-uid',
    objectMetadataId: customObjectId,
    objectMetadataUniversalIdentifier: customObjectUniversalIdentifier,
    type: FieldMetadataType.TEXT,
    name: 'name',
    applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  });

  const nameDescriptionField = getFlatFieldMetadataMock({
    id: nameDescriptionFieldId,
    universalIdentifier: 'name-description-field-uid',
    objectMetadataId: customObjectId,
    objectMetadataUniversalIdentifier: customObjectUniversalIdentifier,
    type: FieldMetadataType.TEXT,
    name: 'nameDescription',
    applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  });

  const searchVectorField = buildSearchVectorField({
    objectMetadataId: customObjectId,
    objectMetadataUniversalIdentifier: customObjectUniversalIdentifier,
    applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  });

  const customObject = getFlatObjectMetadataMock({
    id: customObjectId,
    universalIdentifier: customObjectUniversalIdentifier,
    isSearchable: true,
    applicationId: CUSTOM_APPLICATION_ID,
    applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    labelIdentifierFieldMetadataId: nameFieldId,
    fieldUniversalIdentifiers: [
      nameField.universalIdentifier,
      nameDescriptionField.universalIdentifier,
      searchVectorField.universalIdentifier,
    ],
  });

  return { customObject, nameField, nameDescriptionField, searchVectorField };
};

describe('buildSearchFieldMetadataBackfillOperations', () => {
  it('selects only the name field for a custom object, ignoring a prefix-overlapping field name', () => {
    const { customObject, nameField, nameDescriptionField, searchVectorField } =
      buildCustomObjectFixture();

    const { flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier } =
      buildSearchFieldMetadataBackfillOperations({
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([customObject]),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          nameField,
          nameDescriptionField,
          searchVectorField,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([]),
        standardFlatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps(
          [],
        ),
        customApplicationId: CUSTOM_APPLICATION_ID,
      });

    const customApplicationRows =
      flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier[
        CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER
      ];

    expect(customApplicationRows).toHaveLength(1);
    expect(customApplicationRows?.[0].fieldMetadataUniversalIdentifier).toBe(
      nameField.universalIdentifier,
    );
    expect(customApplicationRows?.[0].objectMetadataUniversalIdentifier).toBe(
      customObject.universalIdentifier,
    );
    // The row points at the object's searchVector field via the new FK.
    expect(
      customApplicationRows?.[0].tsVectorFieldMetadataUniversalIdentifier,
    ).toBe(searchVectorField.universalIdentifier);
    // Custom object name field is seeded at position 0.
    expect(customApplicationRows?.[0].position).toBe(0);
    // No spurious row for the prefix-overlapping `nameDescription` field.
    expect(
      customApplicationRows?.some(
        (row) =>
          row.fieldMetadataUniversalIdentifier ===
          nameDescriptionField.universalIdentifier,
      ),
    ).toBe(false);
  });

  it('creates no row for a searchable custom object that has no name field (junction object whose label identifier is a UUID id field)', () => {
    const junctionObjectId = 'junction-object-id';
    const junctionObjectUniversalIdentifier = 'junction-object-uid';
    const idFieldId = 'junction-id-field-id';

    // No name field: the label identifier falls back to the UUID `id` field.
    // UUID is a searchable type, so a label-identifier-based derivation would
    // wrongly emit a row — but pre-2.15 indexes nothing here, so backfill must
    // skip it. Regression guard for the junction-object over-creation bug.
    const idField = getFlatFieldMetadataMock({
      id: idFieldId,
      universalIdentifier: 'junction-id-field-uid',
      objectMetadataId: junctionObjectId,
      objectMetadataUniversalIdentifier: junctionObjectUniversalIdentifier,
      type: FieldMetadataType.UUID,
      name: 'id',
      applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    const junctionObject = getFlatObjectMetadataMock({
      id: junctionObjectId,
      universalIdentifier: junctionObjectUniversalIdentifier,
      isSearchable: true,
      applicationId: CUSTOM_APPLICATION_ID,
      applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      labelIdentifierFieldMetadataId: idFieldId,
      fieldUniversalIdentifiers: [idField.universalIdentifier],
    });

    const { flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier } =
      buildSearchFieldMetadataBackfillOperations({
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([junctionObject]),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([idField]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([]),
        standardFlatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps(
          [],
        ),
        customApplicationId: CUSTOM_APPLICATION_ID,
      });

    expect(
      Object.keys(
        flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
      ),
    ).toHaveLength(0);
  });

  it('groups rows per application: standard-object rows under the standard application, custom-object rows under the custom application', () => {
    const { customObject, nameField, nameDescriptionField, searchVectorField } =
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

    const standardSearchVectorField = buildSearchVectorField({
      objectMetadataId: standardObjectId,
      objectMetadataUniversalIdentifier: standardObjectUniversalIdentifier,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    const standardObject = getStandardFlatObjectMetadataMock({
      id: standardObjectId,
      universalIdentifier: standardObjectUniversalIdentifier,
      isSearchable: true,
      labelIdentifierFieldMetadataId: standardFieldId,
      fieldIds: [standardFieldId],
      fieldUniversalIdentifiers: [
        standardFieldUniversalIdentifier,
        standardSearchVectorField.universalIdentifier,
      ],
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
          nameField,
          nameDescriptionField,
          searchVectorField,
          standardField,
          standardSearchVectorField,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([]),
        standardFlatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([
          standardSearchFieldMetadata,
        ]),
        customApplicationId: CUSTOM_APPLICATION_ID,
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
    expect(
      standardApplicationRows?.[0].tsVectorFieldMetadataUniversalIdentifier,
    ).toBe(standardSearchVectorField.universalIdentifier);

    const customApplicationRows =
      flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier[
        CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER
      ];

    expect(customApplicationRows).toHaveLength(1);
    expect(customApplicationRows?.[0].fieldMetadataUniversalIdentifier).toBe(
      nameField.universalIdentifier,
    );
    expect(
      customApplicationRows?.[0].tsVectorFieldMetadataUniversalIdentifier,
    ).toBe(searchVectorField.universalIdentifier);
  });

  it('selects only the standard-set field on a standard object, never a prefix-overlapping sibling (phone vs phoneNumber)', () => {
    const standardObjectId = 'standard-object-id';
    const standardObjectUniversalIdentifier = 'standard-object-uid';

    // Two fields whose names overlap by prefix. Only `phone` is part of the
    // standard search set; `phoneNumber` must never be pulled in. The old
    // asExpression-token heuristic could mis-bind these by name; the id-based
    // derivation cannot.
    const phoneFieldId = 'phone-field-id';
    const phoneFieldUniversalIdentifier = 'phone-field-uid';
    const phoneNumberFieldId = 'phone-number-field-id';
    const phoneNumberFieldUniversalIdentifier = 'phone-number-field-uid';

    const phoneField = getFlatFieldMetadataMock({
      id: phoneFieldId,
      universalIdentifier: phoneFieldUniversalIdentifier,
      objectMetadataId: standardObjectId,
      objectMetadataUniversalIdentifier: standardObjectUniversalIdentifier,
      type: FieldMetadataType.TEXT,
      name: 'phone',
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    const phoneNumberField = getFlatFieldMetadataMock({
      id: phoneNumberFieldId,
      universalIdentifier: phoneNumberFieldUniversalIdentifier,
      objectMetadataId: standardObjectId,
      objectMetadataUniversalIdentifier: standardObjectUniversalIdentifier,
      type: FieldMetadataType.TEXT,
      name: 'phoneNumber',
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    const standardSearchVectorField = buildSearchVectorField({
      objectMetadataId: standardObjectId,
      objectMetadataUniversalIdentifier: standardObjectUniversalIdentifier,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    const standardObject = getStandardFlatObjectMetadataMock({
      id: standardObjectId,
      universalIdentifier: standardObjectUniversalIdentifier,
      isSearchable: true,
      labelIdentifierFieldMetadataId: phoneFieldId,
      fieldIds: [phoneFieldId, phoneNumberFieldId],
      fieldUniversalIdentifiers: [
        phoneFieldUniversalIdentifier,
        phoneNumberFieldUniversalIdentifier,
        standardSearchVectorField.universalIdentifier,
      ],
    });

    const phoneSearchFieldMetadata = buildSearchFieldMetadata({
      id: 'phone-search-field-id',
      universalIdentifier: 'phone-search-field-uid',
      objectMetadataId: standardObjectId,
      fieldMetadataId: phoneFieldId,
      objectMetadataUniversalIdentifier: standardObjectUniversalIdentifier,
      fieldMetadataUniversalIdentifier: phoneFieldUniversalIdentifier,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    const { flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier } =
      buildSearchFieldMetadataBackfillOperations({
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([standardObject]),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          phoneField,
          phoneNumberField,
          standardSearchVectorField,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([]),
        standardFlatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([
          phoneSearchFieldMetadata,
        ]),
        customApplicationId: CUSTOM_APPLICATION_ID,
      });

    const standardApplicationRows =
      flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier[
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
      ];

    expect(standardApplicationRows).toHaveLength(1);
    expect(standardApplicationRows?.[0].fieldMetadataUniversalIdentifier).toBe(
      phoneFieldUniversalIdentifier,
    );
    // The prefix-overlapping `phoneNumber` field is never selected.
    expect(
      standardApplicationRows?.some(
        (row) =>
          row.fieldMetadataUniversalIdentifier ===
          phoneNumberFieldUniversalIdentifier,
      ),
    ).toBe(false);
  });

  it('carries the position from the standard maps row onto the backfilled standard row', () => {
    const standardObjectId = 'standard-object-id';
    const standardObjectUniversalIdentifier = 'standard-object-uid';
    const emailsFieldId = 'emails-field-id';
    const emailsFieldUniversalIdentifier = 'emails-field-uid';

    const emailsField = getFlatFieldMetadataMock({
      id: emailsFieldId,
      universalIdentifier: emailsFieldUniversalIdentifier,
      objectMetadataId: standardObjectId,
      objectMetadataUniversalIdentifier: standardObjectUniversalIdentifier,
      type: FieldMetadataType.TEXT,
      name: 'emails',
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    const standardSearchVectorField = buildSearchVectorField({
      objectMetadataId: standardObjectId,
      objectMetadataUniversalIdentifier: standardObjectUniversalIdentifier,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    const standardObject = getStandardFlatObjectMetadataMock({
      id: standardObjectId,
      universalIdentifier: standardObjectUniversalIdentifier,
      isSearchable: true,
      labelIdentifierFieldMetadataId: emailsFieldId,
      fieldIds: [emailsFieldId],
      fieldUniversalIdentifiers: [
        emailsFieldUniversalIdentifier,
        standardSearchVectorField.universalIdentifier,
      ],
    });

    // The standard maps row sits at position 3 (e.g. SEARCH_FIELDS_FOR_PERSON order);
    // backfill must replicate that ordinal, not reset it to 0.
    const standardSearchFieldMetadata = buildSearchFieldMetadata({
      id: 'emails-search-field-id',
      universalIdentifier: 'emails-search-field-uid',
      objectMetadataId: standardObjectId,
      fieldMetadataId: emailsFieldId,
      objectMetadataUniversalIdentifier: standardObjectUniversalIdentifier,
      fieldMetadataUniversalIdentifier: emailsFieldUniversalIdentifier,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      position: 3,
    });

    const { flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier } =
      buildSearchFieldMetadataBackfillOperations({
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([standardObject]),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          emailsField,
          standardSearchVectorField,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([]),
        standardFlatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([
          standardSearchFieldMetadata,
        ]),
        customApplicationId: CUSTOM_APPLICATION_ID,
      });

    const standardApplicationRows =
      flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier[
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
      ];

    expect(standardApplicationRows).toHaveLength(1);
    expect(standardApplicationRows?.[0].position).toBe(3);
  });

  it('is a no-op when the searchFieldMetadata rows already exist (idempotent)', () => {
    const { customObject, nameField, nameDescriptionField } =
      buildCustomObjectFixture();

    const existingSearchFieldMetadata = buildSearchFieldMetadata({
      id: 'existing-search-field-id',
      universalIdentifier: 'existing-search-field-uid',
      objectMetadataId: customObject.id,
      fieldMetadataId: nameField.id,
      objectMetadataUniversalIdentifier: customObject.universalIdentifier,
      fieldMetadataUniversalIdentifier: nameField.universalIdentifier,
      applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    const { flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier } =
      buildSearchFieldMetadataBackfillOperations({
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([customObject]),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          nameField,
          nameDescriptionField,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([
          existingSearchFieldMetadata,
        ]),
        standardFlatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps(
          [],
        ),
        customApplicationId: CUSTOM_APPLICATION_ID,
      });

    expect(
      Object.keys(
        flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
      ),
    ).toHaveLength(0);
  });

  it('skips a row whose deterministic universal identifier already exists even when the existing row carries stale metadata ids', () => {
    const { customObject, nameField, nameDescriptionField, searchVectorField } =
      buildCustomObjectFixture();

    // Simulates a retry after a partial run during a cross-version upgrade: the
    // previously committed row still points at the ids the metadata had at insert
    // time, while the object/field maps now expose new ids (id churn from earlier
    // upgrade commands). The (objectMetadataId, fieldMetadataId) dedupe misses the
    // pair, but the deterministic universal identifier is unchanged and must
    // prevent re-emitting the row.
    const existingSearchFieldMetadata = buildSearchFieldMetadata({
      id: 'existing-search-field-id',
      universalIdentifier: getSearchFieldUniversalIdentifier({
        applicationUniversalIdentifier:
          CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        fieldMetadataUniversalIdentifier: nameField.universalIdentifier,
      }),
      objectMetadataId: 'stale-object-metadata-id',
      fieldMetadataId: 'stale-field-metadata-id',
      objectMetadataUniversalIdentifier: customObject.universalIdentifier,
      fieldMetadataUniversalIdentifier: nameField.universalIdentifier,
      applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    const { flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier } =
      buildSearchFieldMetadataBackfillOperations({
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([customObject]),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          nameField,
          nameDescriptionField,
          searchVectorField,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([
          existingSearchFieldMetadata,
        ]),
        standardFlatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps(
          [],
        ),
        customApplicationId: CUSTOM_APPLICATION_ID,
      });

    expect(
      Object.keys(
        flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
      ),
    ).toHaveLength(0);
  });

  it('skips a custom object whose name field is not a searchable type', () => {
    const customObjectId = 'relation-name-object-id';
    const customObjectUniversalIdentifier = 'relation-name-object-uid';
    const relationNameFieldId = 'relation-name-field-id';

    // A `name` field that is a RELATION (non-searchable) type: pre-2.15 would not
    // include it in the tsvector and the recompute filters it out, so no row.
    const relationNameField = getFlatFieldMetadataMock({
      id: relationNameFieldId,
      universalIdentifier: 'relation-name-field-uid',
      objectMetadataId: customObjectId,
      objectMetadataUniversalIdentifier: customObjectUniversalIdentifier,
      type: FieldMetadataType.RELATION,
      name: 'name',
      applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    const customObject = getFlatObjectMetadataMock({
      id: customObjectId,
      universalIdentifier: customObjectUniversalIdentifier,
      isSearchable: true,
      applicationId: CUSTOM_APPLICATION_ID,
      applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      labelIdentifierFieldMetadataId: relationNameFieldId,
      fieldUniversalIdentifiers: [relationNameField.universalIdentifier],
    });

    const { flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier } =
      buildSearchFieldMetadataBackfillOperations({
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([customObject]),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([relationNameField]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([]),
        standardFlatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps(
          [],
        ),
        customApplicationId: CUSTOM_APPLICATION_ID,
      });

    expect(
      Object.keys(
        flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
      ),
    ).toHaveLength(0);
  });

  it('skips a searchable object owned by a third-party application (only the workspace custom application is backfilled)', () => {
    const thirdPartyApplicationId = 'third-party-application-id';
    const thirdPartyApplicationUniversalIdentifier =
      'third-party-application-uid';
    const { customObject, nameField, nameDescriptionField } =
      buildCustomObjectFixture();

    // Same fixture but owned by a different (third-party) application: each application
    // owns its own searchFieldMetadata, so this backfill must not fabricate a row for it.
    const thirdPartyObject: FlatObjectMetadata = {
      ...customObject,
      applicationId: thirdPartyApplicationId,
      applicationUniversalIdentifier: thirdPartyApplicationUniversalIdentifier,
    };

    const { flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier } =
      buildSearchFieldMetadataBackfillOperations({
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([thirdPartyObject]),
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          nameField,
          nameDescriptionField,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([]),
        standardFlatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps(
          [],
        ),
        customApplicationId: CUSTOM_APPLICATION_ID,
      });

    expect(
      Object.keys(
        flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
      ),
    ).toHaveLength(0);
  });

  it('skips non-searchable objects', () => {
    const { customObject, nameField, nameDescriptionField } =
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
          nameField,
          nameDescriptionField,
        ]),
        flatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps([]),
        standardFlatSearchFieldMetadataMaps: buildFlatSearchFieldMetadataMaps(
          [],
        ),
        customApplicationId: CUSTOM_APPLICATION_ID,
      });

    expect(
      Object.keys(
        flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
      ),
    ).toHaveLength(0);
  });
});
