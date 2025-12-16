import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateFindRecordsOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateFindRecordsOutputSchema';

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

describe('generateFindRecordsOutputSchema', () => {
  it('should generate schema with first, all, and totalCount properties', () => {
    const objectMetadataItem = createMockObjectMetadataItem();

    const result = generateFindRecordsOutputSchema(objectMetadataItem);

    expect(result).toHaveProperty('first');
    expect(result).toHaveProperty('all');
    expect(result).toHaveProperty('totalCount');
  });

  describe('first property', () => {
    it('should be a non-leaf node with record schema as value', () => {
      const objectMetadataItem = createMockObjectMetadataItem({
        labelSingular: 'Company',
      });

      const result = generateFindRecordsOutputSchema(objectMetadataItem);

      expect(result.first).toMatchObject({
        isLeaf: false,
        icon: 'IconAlpha',
        label: 'First Company',
      });
      expect(result.first.value).toHaveProperty('_outputSchemaType', 'RECORD');
    });

    it('should use default label when labelSingular is undefined', () => {
      const objectMetadataItem = createMockObjectMetadataItem({
        labelSingular: undefined as any,
      });

      const result = generateFindRecordsOutputSchema(objectMetadataItem);

      expect(result.first.label).toBe('First Record');
    });
  });

  describe('all property', () => {
    it('should be a leaf node with array type', () => {
      const objectMetadataItem = createMockObjectMetadataItem({
        labelPlural: 'Companies',
      });

      const result = generateFindRecordsOutputSchema(objectMetadataItem);

      expect(result.all).toMatchObject({
        isLeaf: true,
        icon: 'IconListDetails',
        label: 'All Companies',
        type: 'array',
        value: 'Returns an array of records',
      });
    });

    it('should use default label when labelPlural is undefined', () => {
      const objectMetadataItem = createMockObjectMetadataItem({
        labelPlural: undefined as any,
      });

      const result = generateFindRecordsOutputSchema(objectMetadataItem);

      expect(result.all?.label).toBe('All Records');
    });
  });

  describe('totalCount property', () => {
    it('should be a leaf node with number type', () => {
      const objectMetadataItem = createMockObjectMetadataItem();

      const result = generateFindRecordsOutputSchema(objectMetadataItem);

      expect(result.totalCount).toMatchObject({
        isLeaf: true,
        icon: 'IconSum',
        label: 'Total Count',
        type: 'number',
        value: 'Count of matching records',
      });
    });
  });

  it('should include record fields in first value', () => {
    const objectMetadataItem = createMockObjectMetadataItem({
      fields: [
        {
          id: 'name-field-id',
          name: 'name',
          label: 'Name',
          type: 'TEXT',
          isActive: true,
          isSystem: false,
        },
      ] as any,
    });

    const result = generateFindRecordsOutputSchema(objectMetadataItem);

    expect(result.first.value).toHaveProperty('fields');
    expect((result.first.value as any).fields).toHaveProperty('name');
  });
});
