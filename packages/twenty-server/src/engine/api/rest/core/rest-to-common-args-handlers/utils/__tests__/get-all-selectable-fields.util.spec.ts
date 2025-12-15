import { FieldMetadataType } from 'twenty-shared/types';

import { getAllSelectableFields } from 'src/engine/api/rest/core/rest-to-common-args-handlers/utils/get-all-selectable-fields.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

describe('getAllSelectableFields', () => {
  const createMockField = (
    overrides: Partial<FlatFieldMetadata> & {
      id: string;
      name: string;
      type: FieldMetadataType;
    },
  ): FlatFieldMetadata =>
    ({
      objectMetadataId: 'object-id',
      workspaceId: 'workspace-id',
      isNullable: true,
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

  const buildFlatObjectMetadata = (fieldIds: string[]): FlatObjectMetadata =>
    ({
      id: 'object-id',
      workspaceId: 'workspace-id',
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
      universalIdentifier: 'object-id',
      fieldMetadataIds: fieldIds,
      indexMetadataIds: [],
      viewIds: [],
      applicationId: null,
    }) as unknown as FlatObjectMetadata;

  it('should return all fields as selectable when no restrictions', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const field2 = createMockField({
      id: 'field-2',
      name: 'email',
      type: FieldMetadataType.TEXT,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([field1, field2]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1', 'field-2']);

    const result = getAllSelectableFields({
      restrictedFields: {},
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({
      name: true,
      email: true,
    });
  });

  it('should not return restricted fields', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const field2 = createMockField({
      id: 'field-2',
      name: 'email',
      type: FieldMetadataType.TEXT,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([field1, field2]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1', 'field-2']);

    const result = getAllSelectableFields({
      restrictedFields: {
        'field-2': { canRead: false },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({
      name: true,
    });
  });

  it('should create nested objects for composite fields', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const field2 = createMockField({
      id: 'field-2',
      name: 'fullName',
      type: FieldMetadataType.FULL_NAME,
    });
    const field3 = createMockField({
      id: 'field-3',
      name: 'domainName',
      type: FieldMetadataType.LINKS,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
      field1,
      field2,
      field3,
    ]);
    const flatObjectMetadata = buildFlatObjectMetadata([
      'field-1',
      'field-2',
      'field-3',
    ]);

    const result = getAllSelectableFields({
      restrictedFields: {},
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({
      name: true,
      fullName: {
        firstName: true,
        lastName: true,
      },
      domainName: {
        primaryLinkLabel: true,
        primaryLinkUrl: true,
        secondaryLinks: true,
      },
    });
  });

  it('should restrict all sub-fields when composite field is restricted', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const field2 = createMockField({
      id: 'field-2',
      name: 'fullName',
      type: FieldMetadataType.FULL_NAME,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([field1, field2]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1', 'field-2']);

    const result = getAllSelectableFields({
      restrictedFields: {
        'field-2': { canRead: false },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({
      name: true,
    });
  });

  it('should handle mixed regular and composite fields with restrictions', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const field2 = createMockField({
      id: 'field-2',
      name: 'email',
      type: FieldMetadataType.TEXT,
    });
    const field3 = createMockField({
      id: 'field-3',
      name: 'fullName',
      type: FieldMetadataType.FULL_NAME,
    });
    const field4 = createMockField({
      id: 'field-4',
      name: 'address',
      type: FieldMetadataType.ADDRESS,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
      field1,
      field2,
      field3,
      field4,
    ]);
    const flatObjectMetadata = buildFlatObjectMetadata([
      'field-1',
      'field-2',
      'field-3',
      'field-4',
    ]);

    const result = getAllSelectableFields({
      restrictedFields: {
        'field-2': { canRead: false },
        'field-4': { canRead: false },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({
      name: true,
      fullName: {
        firstName: true,
        lastName: true,
      },
    });
  });
});
