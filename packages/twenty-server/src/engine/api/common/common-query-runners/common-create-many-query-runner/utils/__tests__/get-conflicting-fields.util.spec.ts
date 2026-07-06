import { FieldMetadataType } from 'twenty-shared/types';

import { getConflictingFields } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/get-conflicting-fields.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

describe('getConflictingFields', () => {
  const workspaceId = 'workspaceId';
  const objectMetadataId = 'objectMetadataId';

  const createMockField = (
    overrides: Partial<FlatFieldMetadata> & {
      id: string;
      name: string;
      type: FieldMetadataType;
    },
  ): FlatFieldMetadata =>
    ({
      workspaceId,
      objectMetadataId,
      isNullable: false,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: overrides.id,
      viewFieldIds: [],
      viewFilterIds: [],
      kanbanAggregateOperationViewIds: [],
      calendarViewIds: [],
      applicationId: null,
      label: overrides.name,
      ...overrides,
    }) as FlatFieldMetadata;

  const createMockIndex = (
    overrides: Partial<FlatIndexMetadata> & {
      id: string;
      flatIndexFieldMetadatas: { fieldMetadataId: string }[];
    },
  ): FlatIndexMetadata =>
    ({
      id: overrides.id,
      workspaceId,
      objectMetadataId,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: overrides.id,
      applicationId: null,
      isUnique: true,
      flatIndexFieldMetadatas: overrides.flatIndexFieldMetadatas,
      universalFlatIndexFieldMetadatas: [],
      ...overrides,
    }) as FlatIndexMetadata;

  const idField = createMockField({
    id: 'id-field-id',
    name: 'id',
    type: FieldMetadataType.UUID,
    isUnique: true,
  });

  const uniqueTextField = createMockField({
    id: 'unique-text-id',
    name: 'uniqueText',
    type: FieldMetadataType.TEXT,
    isUnique: true,
  });

  const textFieldOne = createMockField({
    id: 'text-field-one-id',
    name: 'textFieldOne',
    type: FieldMetadataType.TEXT,
    isUnique: false,
  });

  const textFieldTwo = createMockField({
    id: 'text-field-two-id',
    name: 'textFieldTwo',
    type: FieldMetadataType.TEXT,
    isUnique: false,
  });

  const emailsUniqueField = createMockField({
    id: 'emails-unique-id',
    name: 'emailsField',
    type: FieldMetadataType.EMAILS,
    isUnique: true,
  });

  const phonesUniqueField = createMockField({
    id: 'phones-unique-id',
    name: 'phonesField',
    type: FieldMetadataType.PHONES,
    isUnique: true,
  });

  const phonesNotUniqueField = createMockField({
    id: 'phones-not-unique-id',
    name: 'phonesField',
    type: FieldMetadataType.PHONES,
    isUnique: false,
  });

  const addressUniqueFieldNoIncludedProp = createMockField({
    id: 'address-unique-id',
    name: 'addressField',
    type: FieldMetadataType.ADDRESS,
    isUnique: true,
  });

  const buildFlatObjectMetadata = ({
    fields,
    indexMetadataIds = [],
  }: {
    fields: FlatFieldMetadata[];
    indexMetadataIds?: string[];
  }): FlatObjectMetadata =>
    ({
      id: objectMetadataId,
      workspaceId,
      nameSingular: 'testObject',
      namePlural: 'testObjects',
      labelSingular: 'Test Object',
      labelPlural: 'Test Objects',
      isCustom: false,
      isRemote: false,
      isActive: true,
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: objectMetadataId,
      fieldIds: fields.map((f) => f.id),
      indexMetadataIds,
      viewIds: [],
      applicationId: null,
    }) as unknown as FlatObjectMetadata;

  const buildFlatFieldMetadataMaps = (
    fields: FlatFieldMetadata[],
  ): FlatEntityMaps<FlatFieldMetadata> => ({
    byUniversalIdentifier: fields.reduce(
      (acc, field) => {
        acc[field.universalIdentifier] = field;

        return acc;
      },
      {} as Record<string, FlatFieldMetadata>,
    ),
    universalIdentifierById: fields.reduce(
      (acc, field) => {
        acc[field.id] = field.universalIdentifier;

        return acc;
      },
      {} as Record<string, string>,
    ),
    universalIdentifiersByApplicationId: {},
  });

  const buildFlatIndexMetadataMaps = (
    indexes: FlatIndexMetadata[],
  ): FlatEntityMaps<FlatIndexMetadata> => ({
    byUniversalIdentifier: indexes.reduce(
      (acc, index) => {
        acc[index.universalIdentifier] = index;

        return acc;
      },
      {} as Record<string, FlatIndexMetadata>,
    ),
    universalIdentifierById: indexes.reduce(
      (acc, index) => {
        acc[index.id] = index.universalIdentifier;

        return acc;
      },
      {} as Record<string, string>,
    ),
    universalIdentifiersByApplicationId: {},
  });

  it('returns id and unique non-composite fields as conflicts', () => {
    const fields = [idField, uniqueTextField];
    const flatObjectMetadata = buildFlatObjectMetadata({ fields });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);

    const result = getConflictingFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    expect(result).toEqual(
      expect.arrayContaining([
        {
          baseField: 'id',
          conflictingProperties: [{ fullPath: 'id', column: 'id' }],
        },
        {
          baseField: 'uniqueText',
          conflictingProperties: [
            { fullPath: 'uniqueText', column: 'uniqueText' },
          ],
        },
      ]),
    );
  });

  it('returns index-based composite conflicts for multi-field unique indexes', () => {
    const fields = [idField, textFieldOne, textFieldTwo];
    const uniqueIndex = createMockIndex({
      id: 'multi-field-unique-index-id',
      flatIndexFieldMetadatas: [
        { fieldMetadataId: textFieldOne.id },
        { fieldMetadataId: textFieldTwo.id },
      ],
    });
    const flatObjectMetadata = buildFlatObjectMetadata({
      fields,
      indexMetadataIds: [uniqueIndex.id],
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);
    const flatIndexMaps = buildFlatIndexMetadataMaps([uniqueIndex]);

    const result = getConflictingFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatIndexMaps,
    );

    expect(result).toEqual(
      expect.arrayContaining([
        {
          baseField: 'textFieldOne',
          conflictingProperties: [
            { fullPath: 'textFieldOne', column: 'textFieldOne' },
            { fullPath: 'textFieldTwo', column: 'textFieldTwo' },
          ],
        },
      ]),
    );
  });

  it('returns composite field with included unique property using full path and computed column', () => {
    const fields = [idField, emailsUniqueField];
    const flatObjectMetadata = buildFlatObjectMetadata({ fields });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);

    const result = getConflictingFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    expect(result).toEqual(
      expect.arrayContaining([
        {
          baseField: 'id',
          conflictingProperties: [{ fullPath: 'id', column: 'id' }],
        },
        {
          baseField: 'emailsField',
          conflictingProperties: [
            {
              fullPath: 'emailsField.primaryEmail',
              column: 'emailsFieldPrimaryEmail',
            },
          ],
        },
      ]),
    );
  });

  it('returns every included unique property for phone composite fields', () => {
    const fields = [idField, phonesUniqueField];
    const flatObjectMetadata = buildFlatObjectMetadata({ fields });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);

    const result = getConflictingFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    expect(result).toEqual([
      {
        baseField: 'id',
        conflictingProperties: [{ fullPath: 'id', column: 'id' }],
      },
      {
        baseField: 'phonesField',
        conflictingProperties: [
          {
            fullPath: 'phonesField.primaryPhoneNumber',
            column: 'phonesFieldPrimaryPhoneNumber',
          },
          {
            fullPath: 'phonesField.primaryPhoneCountryCode',
            column: 'phonesFieldPrimaryPhoneCountryCode',
          },
          {
            fullPath: 'phonesField.primaryPhoneCallingCode',
            column: 'phonesFieldPrimaryPhoneCallingCode',
          },
        ],
      },
    ]);
  });

  it('does not include composite fields without included unique property', () => {
    const fields = [idField, addressUniqueFieldNoIncludedProp];
    const flatObjectMetadata = buildFlatObjectMetadata({ fields });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);

    const result = getConflictingFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    expect(result).toEqual([
      {
        baseField: 'id',
        conflictingProperties: [{ fullPath: 'id', column: 'id' }],
      },
    ]);
  });

  it('ignores non-unique fields', () => {
    const fields = [idField, phonesNotUniqueField];
    const flatObjectMetadata = buildFlatObjectMetadata({ fields });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);

    const result = getConflictingFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    expect(result).toEqual([
      {
        baseField: 'id',
        conflictingProperties: [{ fullPath: 'id', column: 'id' }],
      },
    ]);
  });
});
