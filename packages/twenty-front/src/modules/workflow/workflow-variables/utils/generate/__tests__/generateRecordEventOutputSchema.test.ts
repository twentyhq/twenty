import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateRecordEventOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateRecordEventOutputSchema';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { DatabaseEventAction } from '~/generated/graphql';

const createMockObjectMetadataItem = (
  overrides: Partial<ObjectMetadataItem> = {},
): ObjectMetadataItem =>
  ({
    id: 'test-object-id',
    nameSingular: 'testObject',
    namePlural: 'testObjects',
    labelSingular: 'Test Object',
    labelPlural: 'Test Objects',
    icon: 'IconTest',
    fields: [],
    ...overrides,
  }) as ObjectMetadataItem;

describe('generateRecordEventOutputSchema', () => {
  describe('CREATED action', () => {
    it('should generate schema with properties.after prefix', () => {
      const objectMetadataItem = createMockObjectMetadataItem({
        id: 'company-id',
        labelSingular: 'Company',
        icon: 'IconBuilding',
      });

      const result = generateRecordEventOutputSchema(
        objectMetadataItem,
        DatabaseEventAction.CREATED,
      );

      expect(result).toEqual({
        object: {
          icon: 'IconBuilding',
          label: 'Company',
          objectMetadataId: 'company-id',
          fieldIdName: 'properties.after.id',
        },
        fields: {},
        _outputSchemaType: 'RECORD',
      });
    });

    it('should prefix field names with properties.after', () => {
      const objectMetadataItem = createMockObjectMetadataItem({
        fields: [
          {
            id: 'name-field-id',
            name: 'name',
            label: 'Name',
            type: FieldMetadataType.TEXT,
            isActive: true,
            isSystem: false,
            icon: 'IconText',
          },
        ] as any,
      });

      const result = generateRecordEventOutputSchema(
        objectMetadataItem,
        DatabaseEventAction.CREATED,
      );

      expect(Object.keys(result.fields)).toContain('properties.after.name');
    });
  });

  describe('UPDATED action', () => {
    it('should generate schema with properties.after prefix', () => {
      const objectMetadataItem = createMockObjectMetadataItem({
        id: 'company-id',
        labelSingular: 'Company',
      });

      const result = generateRecordEventOutputSchema(
        objectMetadataItem,
        DatabaseEventAction.UPDATED,
      );

      expect(result.object.fieldIdName).toBe('properties.after.id');
    });
  });

  describe('DELETED action', () => {
    it('should generate schema with properties.before prefix', () => {
      const objectMetadataItem = createMockObjectMetadataItem({
        id: 'company-id',
        labelSingular: 'Company',
      });

      const result = generateRecordEventOutputSchema(
        objectMetadataItem,
        DatabaseEventAction.DELETED,
      );

      expect(result.object.fieldIdName).toBe('properties.before.id');
    });

    it('should prefix field names with properties.before', () => {
      const objectMetadataItem = createMockObjectMetadataItem({
        fields: [
          {
            id: 'name-field-id',
            name: 'name',
            label: 'Name',
            type: FieldMetadataType.TEXT,
            isActive: true,
            isSystem: false,
          },
        ] as any,
      });

      const result = generateRecordEventOutputSchema(
        objectMetadataItem,
        DatabaseEventAction.DELETED,
      );

      expect(Object.keys(result.fields)).toContain('properties.before.name');
    });
  });

  describe('DESTROYED action', () => {
    it('should generate schema with properties.before prefix', () => {
      const objectMetadataItem = createMockObjectMetadataItem({
        id: 'company-id',
        labelSingular: 'Company',
      });

      const result = generateRecordEventOutputSchema(
        objectMetadataItem,
        DatabaseEventAction.DESTROYED,
      );

      expect(result.object.fieldIdName).toBe('properties.before.id');
    });
  });

  describe('UPSERTED action', () => {
    it('should generate schema with properties.after prefix', () => {
      const objectMetadataItem = createMockObjectMetadataItem({
        id: 'company-id',
        labelSingular: 'Company',
      });

      const result = generateRecordEventOutputSchema(
        objectMetadataItem,
        DatabaseEventAction.UPSERTED,
      );

      expect(result.object.fieldIdName).toBe('properties.after.id');
    });
  });

  describe('Field handling', () => {
    it('should exclude inactive fields', () => {
      const objectMetadataItem = createMockObjectMetadataItem({
        fields: [
          {
            id: 'inactive-field-id',
            name: 'inactiveField',
            label: 'Inactive Field',
            type: FieldMetadataType.TEXT,
            isActive: false,
            isSystem: false,
          },
        ] as any,
      });

      const result = generateRecordEventOutputSchema(
        objectMetadataItem,
        DatabaseEventAction.CREATED,
      );

      expect(Object.keys(result.fields)).toHaveLength(0);
    });

    it('should exclude searchVector system field', () => {
      const objectMetadataItem = createMockObjectMetadataItem({
        fields: [
          {
            id: 'search-vector-id',
            name: 'searchVector',
            label: 'Search Vector',
            type: FieldMetadataType.TEXT,
            isActive: true,
            isSystem: true,
          },
        ] as any,
      });

      const result = generateRecordEventOutputSchema(
        objectMetadataItem,
        DatabaseEventAction.CREATED,
      );

      expect(Object.keys(result.fields)).not.toContain(
        'properties.after.searchVector',
      );
    });

    it('should convert relation fields to prefixed UUID id fields', () => {
      const objectMetadataItem = createMockObjectMetadataItem({
        fields: [
          {
            id: 'company-relation-id',
            name: 'company',
            label: 'Company',
            type: FieldMetadataType.RELATION,
            isActive: true,
            isSystem: false,
            icon: 'IconBuilding',
            relation: {
              type: RelationType.MANY_TO_ONE,
            },
          },
        ] as any,
      });

      const result = generateRecordEventOutputSchema(
        objectMetadataItem,
        DatabaseEventAction.CREATED,
      );

      expect(Object.keys(result.fields)).toContain(
        'properties.after.companyId',
      );
      expect(result.fields['properties.after.companyId']).toMatchObject({
        isLeaf: true,
        type: FieldMetadataType.UUID,
      });
    });

    it('should generate composite fields with prefix', () => {
      const objectMetadataItem = createMockObjectMetadataItem({
        fields: [
          {
            id: 'address-field-id',
            name: 'address',
            label: 'Address',
            type: FieldMetadataType.ADDRESS,
            isActive: true,
            isSystem: false,
            icon: 'IconMap',
          },
        ] as any,
      });

      const result = generateRecordEventOutputSchema(
        objectMetadataItem,
        DatabaseEventAction.CREATED,
      );

      expect(Object.keys(result.fields)).toContain('properties.after.address');
      const addressField = result.fields['properties.after.address'];

      expect(addressField).toMatchObject({
        isLeaf: false,
        type: FieldMetadataType.ADDRESS,
      });
    });

    it('should convert MORPH_RELATION fields to prefixed UUID id fields when MANY_TO_ONE', () => {
      const objectMetadataItem = createMockObjectMetadataItem({
        fields: [
          {
            id: 'morph-relation-id',
            name: 'target',
            label: 'Target',
            type: FieldMetadataType.MORPH_RELATION,
            isActive: true,
            isSystem: false,
            icon: 'IconLink',
            settings: {
              relationType: RelationType.MANY_TO_ONE,
            },
          },
        ] as any,
      });

      const result = generateRecordEventOutputSchema(
        objectMetadataItem,
        DatabaseEventAction.CREATED,
      );

      expect(Object.keys(result.fields)).toContain('properties.after.targetId');
      expect(result.fields['properties.after.targetId']).toMatchObject({
        isLeaf: true,
        type: FieldMetadataType.UUID,
      });
    });

    it('should exclude MORPH_RELATION fields when not MANY_TO_ONE', () => {
      const objectMetadataItem = createMockObjectMetadataItem({
        fields: [
          {
            id: 'morph-relation-id',
            name: 'targets',
            label: 'Targets',
            type: FieldMetadataType.MORPH_RELATION,
            isActive: true,
            isSystem: false,
            settings: {
              relationType: RelationType.ONE_TO_MANY,
            },
          },
        ] as any,
      });

      const result = generateRecordEventOutputSchema(
        objectMetadataItem,
        DatabaseEventAction.CREATED,
      );

      expect(Object.keys(result.fields)).not.toContain(
        'properties.after.targets',
      );
      expect(Object.keys(result.fields)).not.toContain(
        'properties.after.targetsId',
      );
    });

    it('should exclude one-to-many relations', () => {
      const objectMetadataItem = createMockObjectMetadataItem({
        fields: [
          {
            id: 'people-relation-id',
            name: 'people',
            label: 'People',
            type: FieldMetadataType.RELATION,
            isActive: true,
            isSystem: false,
            relation: {
              type: RelationType.ONE_TO_MANY,
            },
          },
        ] as any,
      });

      const result = generateRecordEventOutputSchema(
        objectMetadataItem,
        DatabaseEventAction.CREATED,
      );

      expect(Object.keys(result.fields)).not.toContain(
        'properties.after.people',
      );
      expect(Object.keys(result.fields)).not.toContain(
        'properties.after.peopleId',
      );
    });
  });

  describe('Default action handling', () => {
    it('should default to properties.after for unknown action', () => {
      const objectMetadataItem = createMockObjectMetadataItem({
        id: 'company-id',
        labelSingular: 'Company',
      });

      const result = generateRecordEventOutputSchema(
        objectMetadataItem,
        'UNKNOWN_ACTION' as DatabaseEventAction,
      );

      expect(result.object.fieldIdName).toBe('properties.after.id');
    });
  });
});
