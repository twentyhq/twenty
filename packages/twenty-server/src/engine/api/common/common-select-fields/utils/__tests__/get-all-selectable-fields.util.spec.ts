import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { getAllSelectableFields } from 'src/engine/api/common/common-select-fields/utils/get-all-selectable-fields.util';
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
      fieldIds: fieldIds,
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

  describe('onlyUseLabelIdentifierFields flag', () => {
    it('should only return label identifier, id, and image identifier fields when flag is true', () => {
      const idField = createMockField({
        id: 'field-id',
        name: 'id',
        type: FieldMetadataType.UUID,
      });
      const nameField = createMockField({
        id: 'field-1',
        name: 'name',
        type: FieldMetadataType.TEXT,
      });
      const emailField = createMockField({
        id: 'field-2',
        name: 'email',
        type: FieldMetadataType.TEXT,
      });
      const domainNameField = createMockField({
        id: 'field-3',
        name: 'domainName',
        type: FieldMetadataType.LINKS,
      });

      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
        idField,
        nameField,
        emailField,
        domainNameField,
      ]);
      const flatObjectMetadata = {
        ...buildFlatObjectMetadata([
          'field-id',
          'field-1',
          'field-2',
          'field-3',
        ]),
        labelIdentifierFieldMetadataId: 'field-1',
        imageIdentifierFieldMetadataId: 'field-3',
      };

      const result = getAllSelectableFields({
        restrictedFields: {},
        flatObjectMetadata,
        flatFieldMetadataMaps,
        onlyUseLabelIdentifierFieldsInRelations: true,
      });

      expect(result).toEqual({
        id: true,
        name: true,
        domainName: {
          primaryLinkLabel: true,
          primaryLinkUrl: true,
          secondaryLinks: true,
        },
      });
    });

    it('should include domainName for company objects even if not image identifier', () => {
      const idField = createMockField({
        id: 'field-id',
        name: 'id',
        type: FieldMetadataType.UUID,
      });
      const nameField = createMockField({
        id: 'field-1',
        name: 'name',
        type: FieldMetadataType.TEXT,
      });
      const domainNameField = createMockField({
        id: 'field-2',
        name: 'domainName',
        type: FieldMetadataType.LINKS,
      });
      const emailField = createMockField({
        id: 'field-3',
        name: 'email',
        type: FieldMetadataType.TEXT,
      });

      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
        idField,
        nameField,
        domainNameField,
        emailField,
      ]);
      const flatObjectMetadata = {
        ...buildFlatObjectMetadata([
          'field-id',
          'field-1',
          'field-2',
          'field-3',
        ]),
        nameSingular: 'company',
        labelIdentifierFieldMetadataId: 'field-1',
      };

      const result = getAllSelectableFields({
        restrictedFields: {},
        flatObjectMetadata,
        flatFieldMetadataMaps,
        onlyUseLabelIdentifierFieldsInRelations: true,
      });

      expect(result).toEqual({
        id: true,
        name: true,
        domainName: {
          primaryLinkLabel: true,
          primaryLinkUrl: true,
          secondaryLinks: true,
        },
      });
    });

    it('should respect restrictions even with onlyUseLabelIdentifierFields flag', () => {
      const idField = createMockField({
        id: 'field-id',
        name: 'id',
        type: FieldMetadataType.UUID,
      });
      const nameField = createMockField({
        id: 'field-1',
        name: 'name',
        type: FieldMetadataType.TEXT,
      });
      const emailField = createMockField({
        id: 'field-2',
        name: 'email',
        type: FieldMetadataType.TEXT,
      });

      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
        idField,
        nameField,
        emailField,
      ]);
      const flatObjectMetadata = {
        ...buildFlatObjectMetadata(['field-id', 'field-1', 'field-2']),
        labelIdentifierFieldMetadataId: 'field-1',
      };

      const result = getAllSelectableFields({
        restrictedFields: {
          'field-1': { canRead: false },
        },
        flatObjectMetadata,
        flatFieldMetadataMaps,
        onlyUseLabelIdentifierFieldsInRelations: true,
      });

      // Label identifier field is restricted, so it should not be returned
      // even with the flag
      expect(result).toEqual({
        id: true,
      });
    });
  });

  describe('MANY_TO_ONE relation fields', () => {
    it('should return join column name for MANY_TO_ONE relations', () => {
      const nameField = createMockField({
        id: 'field-1',
        name: 'name',
        type: FieldMetadataType.TEXT,
      });
      const companyRelationField = createMockField({
        id: 'field-2',
        name: 'company',
        type: FieldMetadataType.RELATION,
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          joinColumnName: 'companyId',
        },
      });

      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
        nameField,
        companyRelationField,
      ]);
      const flatObjectMetadata = buildFlatObjectMetadata([
        'field-1',
        'field-2',
      ]);

      const result = getAllSelectableFields({
        restrictedFields: {},
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual({
        name: true,
        companyId: true, // join column name instead of relation name
      });
    });

    it('should not return join column if relation field is restricted', () => {
      const nameField = createMockField({
        id: 'field-1',
        name: 'name',
        type: FieldMetadataType.TEXT,
      });
      const companyRelationField = createMockField({
        id: 'field-2',
        name: 'company',
        type: FieldMetadataType.RELATION,
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          joinColumnName: 'companyId',
        },
      });

      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
        nameField,
        companyRelationField,
      ]);
      const flatObjectMetadata = buildFlatObjectMetadata([
        'field-1',
        'field-2',
      ]);

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

    it('should include ONE_TO_MANY relation fields as regular fields', () => {
      const nameField = createMockField({
        id: 'field-1',
        name: 'name',
        type: FieldMetadataType.TEXT,
      });
      const peopleRelationField = createMockField({
        id: 'field-2',
        name: 'people',
        type: FieldMetadataType.RELATION,
        settings: {
          relationType: RelationType.ONE_TO_MANY,
        },
      });

      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
        nameField,
        peopleRelationField,
      ]);
      const flatObjectMetadata = buildFlatObjectMetadata([
        'field-1',
        'field-2',
      ]);

      const result = getAllSelectableFields({
        restrictedFields: {},
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual({
        name: true,
        people: true, // ONE_TO_MANY relations are included as regular fields
      });
    });

    it('should include MANY_TO_ONE relations without joinColumnName as regular fields', () => {
      const nameField = createMockField({
        id: 'field-1',
        name: 'name',
        type: FieldMetadataType.TEXT,
      });
      const relationFieldWithoutJoinColumn = createMockField({
        id: 'field-2',
        name: 'company',
        type: FieldMetadataType.RELATION,
        settings: {
          relationType: RelationType.MANY_TO_ONE,
        },
      });

      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
        nameField,
        relationFieldWithoutJoinColumn,
      ]);
      const flatObjectMetadata = buildFlatObjectMetadata([
        'field-1',
        'field-2',
      ]);

      const result = getAllSelectableFields({
        restrictedFields: {},
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual({
        name: true,
        company: true, // MANY_TO_ONE without joinColumnName are included as regular fields
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty field list', () => {
      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([]);
      const flatObjectMetadata = buildFlatObjectMetadata([]);

      const result = getAllSelectableFields({
        restrictedFields: {},
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual({});
    });

    it('should handle all fields restricted', () => {
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

      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
        field1,
        field2,
      ]);
      const flatObjectMetadata = buildFlatObjectMetadata([
        'field-1',
        'field-2',
      ]);

      const result = getAllSelectableFields({
        restrictedFields: {
          'field-1': { canRead: false },
          'field-2': { canRead: false },
        },
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual({});
    });

    it('should handle canRead: true in restrictedFields', () => {
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

      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
        field1,
        field2,
      ]);
      const flatObjectMetadata = buildFlatObjectMetadata([
        'field-1',
        'field-2',
      ]);

      const result = getAllSelectableFields({
        restrictedFields: {
          'field-1': { canRead: true, canUpdate: false },
          'field-2': { canRead: false, canUpdate: false },
        },
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual({
        name: true,
      });
    });
  });
});
