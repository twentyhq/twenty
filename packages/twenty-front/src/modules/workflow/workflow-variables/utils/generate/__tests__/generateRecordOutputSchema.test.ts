import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateRecordOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateRecordOutputSchema';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

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

describe('generateRecordOutputSchema', () => {
  it('should generate schema with correct object metadata', () => {
    const objectMetadataItem = createMockObjectMetadataItem({
      id: 'company-id',
      labelSingular: 'Company',
      icon: 'IconBuilding',
    });

    const result = generateRecordOutputSchema(objectMetadataItem);

    expect(result).toEqual({
      object: {
        icon: 'IconBuilding',
        label: 'Company',
        objectMetadataId: 'company-id',
        fieldIdName: 'id',
      },
      fields: {},
      _outputSchemaType: 'RECORD',
    });
  });

  it('should generate fields for active non-system fields', () => {
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

    const result = generateRecordOutputSchema(objectMetadataItem);

    expect(result.fields).toHaveProperty('name');
    expect(result.fields.name).toMatchObject({
      isLeaf: true,
      type: FieldMetadataType.TEXT,
      label: 'Name',
      fieldMetadataId: 'name-field-id',
    });
  });

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

    const result = generateRecordOutputSchema(objectMetadataItem);

    expect(result.fields).not.toHaveProperty('inactiveField');
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

    const result = generateRecordOutputSchema(objectMetadataItem);

    expect(result.fields).not.toHaveProperty('searchVector');
  });

  it('should exclude position system field', () => {
    const objectMetadataItem = createMockObjectMetadataItem({
      fields: [
        {
          id: 'position-id',
          name: 'position',
          label: 'Position',
          type: FieldMetadataType.NUMBER,
          isActive: true,
          isSystem: true,
        },
      ] as any,
    });

    const result = generateRecordOutputSchema(objectMetadataItem);

    expect(result.fields).not.toHaveProperty('position');
  });

  it('should include non-excluded system fields', () => {
    const objectMetadataItem = createMockObjectMetadataItem({
      fields: [
        {
          id: 'created-at-id',
          name: 'createdAt',
          label: 'Created At',
          type: FieldMetadataType.DATE_TIME,
          isActive: true,
          isSystem: true,
          icon: 'IconCalendar',
        },
      ] as any,
    });

    const result = generateRecordOutputSchema(objectMetadataItem);

    expect(result.fields).toHaveProperty('createdAt');
  });

  it('should generate composite field with subfields for ADDRESS type', () => {
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

    const result = generateRecordOutputSchema(objectMetadataItem);

    expect(result.fields).toHaveProperty('address');
    expect(result.fields.address).toMatchObject({
      isLeaf: false,
      type: FieldMetadataType.ADDRESS,
      label: 'Address',
      fieldMetadataId: 'address-field-id',
    });
    expect((result.fields.address as any).value).toHaveProperty(
      'addressStreet1',
    );
    expect((result.fields.address as any).value).toHaveProperty('addressCity');
  });

  it('should convert relation fields to UUID id fields', () => {
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

    const result = generateRecordOutputSchema(objectMetadataItem);

    expect(result.fields).not.toHaveProperty('company');
    expect(result.fields).toHaveProperty('companyId');
    expect(result.fields.companyId).toMatchObject({
      isLeaf: true,
      type: FieldMetadataType.UUID,
      label: 'Company Id',
    });
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

    const result = generateRecordOutputSchema(objectMetadataItem);

    expect(result.fields).not.toHaveProperty('people');
    expect(result.fields).not.toHaveProperty('peopleId');
  });

  it('should handle object without icon', () => {
    const objectMetadataItem = createMockObjectMetadataItem({
      icon: null as any,
    });

    const result = generateRecordOutputSchema(objectMetadataItem);

    expect(result.object.icon).toBeUndefined();
  });

  it('should convert MORPH_RELATION fields to UUID id fields when MANY_TO_ONE', () => {
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

    const result = generateRecordOutputSchema(objectMetadataItem);

    expect(result.fields).not.toHaveProperty('target');
    expect(result.fields).toHaveProperty('targetId');
    expect(result.fields.targetId).toMatchObject({
      isLeaf: true,
      type: FieldMetadataType.UUID,
      label: 'Target Id',
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

    const result = generateRecordOutputSchema(objectMetadataItem);

    expect(result.fields).not.toHaveProperty('targets');
    expect(result.fields).not.toHaveProperty('targetsId');
  });

  it('should handle field without icon', () => {
    const objectMetadataItem = createMockObjectMetadataItem({
      fields: [
        {
          id: 'field-no-icon',
          name: 'noIcon',
          label: 'No Icon',
          type: FieldMetadataType.TEXT,
          isActive: true,
          isSystem: false,
          icon: null,
        },
      ] as any,
    });

    const result = generateRecordOutputSchema(objectMetadataItem);

    expect(result.fields.noIcon).toMatchObject({
      icon: undefined,
    });
  });
});
