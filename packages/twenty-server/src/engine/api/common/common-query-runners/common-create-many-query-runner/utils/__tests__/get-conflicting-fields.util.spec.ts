import { FieldMetadataType } from 'twenty-shared/types';

import { getConflictingFields } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/get-conflicting-fields.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
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

  const emailsUniqueField = createMockField({
    id: 'emails-unique-id',
    name: 'emailsField',
    type: FieldMetadataType.EMAILS,
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

  const buildFlatObjectMetadata = (
    fields: FlatFieldMetadata[],
  ): FlatObjectMetadata =>
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
      fieldMetadataIds: fields.map((f) => f.id),
      indexMetadataIds: [],
      viewIds: [],
      applicationId: null,
    }) as unknown as FlatObjectMetadata;

  const buildFlatFieldMetadataMaps = (
    fields: FlatFieldMetadata[],
  ): FlatEntityMaps<FlatFieldMetadata> => ({
    byId: fields.reduce(
      (acc, field) => {
        acc[field.id] = field;

        return acc;
      },
      {} as Record<string, FlatFieldMetadata>,
    ),
    idByUniversalIdentifier: fields.reduce(
      (acc, field) => {
        acc[field.universalIdentifier] = field.id;

        return acc;
      },
      {} as Record<string, string>,
    ),
    universalIdentifiersByApplicationId: {},
  });

  it('returns id and unique non-composite fields as conflicts', () => {
    const fields = [idField, uniqueTextField];
    const flatObjectMetadata = buildFlatObjectMetadata(fields);
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);

    const result = getConflictingFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    expect(result).toEqual(
      expect.arrayContaining([
        { baseField: 'id', fullPath: 'id', column: 'id' },
        {
          baseField: 'uniqueText',
          fullPath: 'uniqueText',
          column: 'uniqueText',
        },
      ]),
    );
  });

  it('returns composite field with included unique property using full path and computed column', () => {
    const fields = [idField, emailsUniqueField];
    const flatObjectMetadata = buildFlatObjectMetadata(fields);
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);

    const result = getConflictingFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    expect(result).toEqual(
      expect.arrayContaining([
        { baseField: 'id', fullPath: 'id', column: 'id' },
        {
          baseField: 'emailsField',
          fullPath: 'emailsField.primaryEmail',
          column: 'emailsFieldPrimaryEmail',
        },
      ]),
    );
  });

  it('does not include composite fields without included unique property', () => {
    const fields = [idField, addressUniqueFieldNoIncludedProp];
    const flatObjectMetadata = buildFlatObjectMetadata(fields);
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);

    const result = getConflictingFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    expect(result).toEqual([{ baseField: 'id', fullPath: 'id', column: 'id' }]);
  });

  it('ignores non-unique fields', () => {
    const fields = [idField, phonesNotUniqueField];
    const flatObjectMetadata = buildFlatObjectMetadata(fields);
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);

    const result = getConflictingFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    expect(result).toEqual([{ baseField: 'id', fullPath: 'id', column: 'id' }]);
  });
});
