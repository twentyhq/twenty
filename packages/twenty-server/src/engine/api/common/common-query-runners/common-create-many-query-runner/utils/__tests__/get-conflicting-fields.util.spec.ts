import { FieldMetadataType, RelationType } from 'twenty-shared/types';

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

  type MockIndexField = {
    fieldMetadataId: string;
    subFieldName?: string | null;
    order?: number;
  };

  const createMockIndex = ({
    id,
    name,
    isUnique,
    fields,
  }: {
    id: string;
    name: string;
    isUnique: boolean;
    fields: MockIndexField[];
  }): FlatIndexMetadata =>
    ({
      id,
      universalIdentifier: id,
      name,
      objectMetadataId,
      workspaceId,
      isUnique,
      indexWhereClause: null,
      isCustom: false,
      applicationId: null,
      flatIndexFieldMetadatas: fields.map((field, index) => ({
        id: `${id}-field-${index}`,
        universalIdentifier: `${id}-field-${index}`,
        indexMetadataId: id,
        fieldMetadataId: field.fieldMetadataId,
        subFieldName: field.subFieldName ?? null,
        order: field.order ?? index,
      })),
    }) as unknown as FlatIndexMetadata;

  const idField = createMockField({
    id: 'id-field-id',
    name: 'id',
    type: FieldMetadataType.UUID,
  });

  const uniqueTextField = createMockField({
    id: 'unique-text-id',
    name: 'uniqueText',
    type: FieldMetadataType.TEXT,
  });

  const otherTextField = createMockField({
    id: 'other-text-id',
    name: 'otherText',
    type: FieldMetadataType.TEXT,
  });

  const emailsField = createMockField({
    id: 'emails-id',
    name: 'emailsField',
    type: FieldMetadataType.EMAILS,
  });

  const phonesField = createMockField({
    id: 'phones-id',
    name: 'phonesField',
    type: FieldMetadataType.PHONES,
  });

  const addressField = createMockField({
    id: 'address-id',
    name: 'addressField',
    type: FieldMetadataType.ADDRESS,
  });

  const companyRelationField = createMockField({
    id: 'company-relation-id',
    name: 'company',
    type: FieldMetadataType.RELATION,
    settings: { relationType: RelationType.MANY_TO_ONE },
  } as Partial<FlatFieldMetadata> & {
    id: string;
    name: string;
    type: FieldMetadataType;
  });

  const buildFlatObjectMetadata = (
    fields: FlatFieldMetadata[],
    indexMetadataIds: string[] = [],
  ): FlatObjectMetadata =>
    ({
      id: objectMetadataId,
      workspaceId,
      nameSingular: 'testObject',
      namePlural: 'testObjects',
      labelSingular: 'Test Object',
      labelPlural: 'Test Objects',
      isRemote: false,
      isActive: true,
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: objectMetadataId,
      fieldIds: fields.map((field) => field.id),
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

  const buildFlatIndexMaps = (
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

  it('returns id and single-field unique index conflicts', () => {
    const fields = [idField, uniqueTextField];
    const index = createMockIndex({
      id: 'unique-text-index',
      name: 'uniqueTextUniqueIndex',
      isUnique: true,
      fields: [{ fieldMetadataId: uniqueTextField.id }],
    });
    const flatObjectMetadata = buildFlatObjectMetadata(fields, [index.id]);
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);
    const flatIndexMaps = buildFlatIndexMaps([index]);

    const result = getConflictingFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatIndexMaps,
    );

    expect(result).toEqual(
      expect.arrayContaining([
        {
          baseFields: ['id'],
          conflictingProperties: [{ fullPath: 'id', column: 'id' }],
        },
        {
          baseFields: ['uniqueText'],
          conflictingProperties: [
            { fullPath: 'uniqueText', column: 'uniqueText' },
          ],
        },
      ]),
    );
  });

  it('returns composite field with included unique property using full path and computed column', () => {
    const fields = [idField, emailsField];
    const index = createMockIndex({
      id: 'emails-index',
      name: 'emailsUniqueIndex',
      isUnique: true,
      fields: [{ fieldMetadataId: emailsField.id }],
    });
    const flatObjectMetadata = buildFlatObjectMetadata(fields, [index.id]);
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);
    const flatIndexMaps = buildFlatIndexMaps([index]);

    const result = getConflictingFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatIndexMaps,
    );

    expect(result).toEqual(
      expect.arrayContaining([
        {
          baseFields: ['id'],
          conflictingProperties: [{ fullPath: 'id', column: 'id' }],
        },
        {
          baseFields: ['emailsField'],
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
    const fields = [idField, phonesField];
    const index = createMockIndex({
      id: 'phones-index',
      name: 'phonesUniqueIndex',
      isUnique: true,
      fields: [{ fieldMetadataId: phonesField.id }],
    });
    const flatObjectMetadata = buildFlatObjectMetadata(fields, [index.id]);
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);
    const flatIndexMaps = buildFlatIndexMaps([index]);

    const result = getConflictingFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatIndexMaps,
    );

    expect(result).toEqual([
      {
        baseFields: ['id'],
        conflictingProperties: [{ fullPath: 'id', column: 'id' }],
      },
      {
        baseFields: ['phonesField'],
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

  it('skips composite unique index without included unique property', () => {
    const fields = [idField, addressField];
    const index = createMockIndex({
      id: 'address-index',
      name: 'addressUniqueIndex',
      isUnique: true,
      fields: [{ fieldMetadataId: addressField.id }],
    });
    const flatObjectMetadata = buildFlatObjectMetadata(fields, [index.id]);
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);
    const flatIndexMaps = buildFlatIndexMaps([index]);

    const result = getConflictingFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatIndexMaps,
    );

    expect(result).toEqual([
      {
        baseFields: ['id'],
        conflictingProperties: [{ fullPath: 'id', column: 'id' }],
      },
    ]);
  });

  it('ignores non-unique indexes', () => {
    const fields = [idField, uniqueTextField];
    const index = createMockIndex({
      id: 'non-unique-index',
      name: 'nonUniqueIndex',
      isUnique: false,
      fields: [{ fieldMetadataId: uniqueTextField.id }],
    });
    const flatObjectMetadata = buildFlatObjectMetadata(fields, [index.id]);
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);
    const flatIndexMaps = buildFlatIndexMaps([index]);

    const result = getConflictingFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatIndexMaps,
    );

    expect(result).toEqual([
      {
        baseFields: ['id'],
        conflictingProperties: [{ fullPath: 'id', column: 'id' }],
      },
    ]);
  });

  it('returns a single group with every column of a composite (multi-field) unique index, ordered', () => {
    const fields = [idField, uniqueTextField, otherTextField];
    const index = createMockIndex({
      id: 'composite-index',
      name: 'uniqueTextOtherTextUniqueIndex',
      isUnique: true,
      fields: [
        { fieldMetadataId: otherTextField.id, order: 1 },
        { fieldMetadataId: uniqueTextField.id, order: 0 },
      ],
    });
    const flatObjectMetadata = buildFlatObjectMetadata(fields, [index.id]);
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);
    const flatIndexMaps = buildFlatIndexMaps([index]);

    const result = getConflictingFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatIndexMaps,
    );

    expect(result).toEqual(
      expect.arrayContaining([
        {
          baseFields: ['uniqueText', 'otherText'],
          conflictingProperties: [
            { fullPath: 'uniqueText', column: 'uniqueText' },
            { fullPath: 'otherText', column: 'otherText' },
          ],
        },
      ]),
    );
  });

  it('resolves relation fields to their join column in a composite unique index', () => {
    const fields = [idField, companyRelationField, uniqueTextField];
    const index = createMockIndex({
      id: 'company-text-index',
      name: 'companyIdUniqueTextUniqueIndex',
      isUnique: true,
      fields: [
        { fieldMetadataId: companyRelationField.id, order: 0 },
        { fieldMetadataId: uniqueTextField.id, order: 1 },
      ],
    });
    const flatObjectMetadata = buildFlatObjectMetadata(fields, [index.id]);
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);
    const flatIndexMaps = buildFlatIndexMaps([index]);

    const result = getConflictingFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatIndexMaps,
    );

    expect(result).toEqual(
      expect.arrayContaining([
        {
          baseFields: ['company', 'uniqueText'],
          conflictingProperties: [
            { fullPath: 'companyId', column: 'companyId' },
            { fullPath: 'uniqueText', column: 'uniqueText' },
          ],
        },
      ]),
    );
  });
});
