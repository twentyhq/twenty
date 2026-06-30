import { getFieldBaseFile } from '@/cli/utilities/entity/entity-field-template';

describe('getFieldBaseFile', () => {
  it('should render proper file using defineField', () => {
    const result = getFieldBaseFile({
      data: {
        name: 'email',
        label: 'Email',
        type: 'TEXT' as any,
        objectUniversalIdentifier: 'abc-123',
      },
      name: 'email',
    });

    expect(result).toContain(
      "import { defineField, FieldType } from 'twenty-sdk/define';",
    );
    expect(result).toContain('export default defineField({');
    expect(result).toContain("name: 'email'");
    expect(result).toContain("label: 'Email'");
    expect(result).toContain('type: FieldType.TEXT');
    expect(result).toContain("objectUniversalIdentifier: 'abc-123'");
  });

  it('should include description when provided', () => {
    const result = getFieldBaseFile({
      data: {
        name: 'phone',
        label: 'Phone',
        type: 'PHONES' as any,
        objectUniversalIdentifier: 'obj-456',
        description: 'Contact phone number',
      },
      name: 'phone',
    });

    expect(result).toContain("description: 'Contact phone number'");
  });

  it('should omit description line when not provided', () => {
    const result = getFieldBaseFile({
      data: {
        name: 'phone',
        label: 'Phone',
        type: 'PHONES' as any,
        objectUniversalIdentifier: 'obj-456',
      },
      name: 'phone',
    });

    expect(result).not.toContain('description:');
  });

  it('should generate a valid UUID for universalIdentifier', () => {
    const result = getFieldBaseFile({
      data: {
        name: 'status',
        label: 'Status',
        type: 'SELECT' as any,
        objectUniversalIdentifier: 'obj-789',
      },
      name: 'status',
    });

    expect(result).toMatch(
      /universalIdentifier: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'/,
    );
  });

  it('should generate unique UUIDs for each call', () => {
    const result1 = getFieldBaseFile({
      data: {
        name: 'field1',
        label: 'Field 1',
        type: 'TEXT' as any,
        objectUniversalIdentifier: 'obj-1',
      },
      name: 'field1',
    });

    const result2 = getFieldBaseFile({
      data: {
        name: 'field2',
        label: 'Field 2',
        type: 'TEXT' as any,
        objectUniversalIdentifier: 'obj-2',
      },
      name: 'field2',
    });

    const uuidRegex =
      /universalIdentifier: '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'/;
    const uuid1 = result1.match(uuidRegex)?.[1];
    const uuid2 = result2.match(uuidRegex)?.[1];

    expect(uuid1).toBeDefined();
    expect(uuid2).toBeDefined();
    expect(uuid1).not.toBe(uuid2);
  });

  it('should render relation properties for a RELATION field', () => {
    const result = getFieldBaseFile({
      data: {
        name: 'company',
        label: 'Company',
        type: 'RELATION' as any,
        objectUniversalIdentifier: 'obj-1',
        relationTargetObjectMetadataUniversalIdentifier: 'target-obj',
        relationTargetFieldMetadataUniversalIdentifier: 'target-field',
        relationType: 'ONE_TO_MANY' as any,
      },
      name: 'company',
    });

    expect(result).toContain(
      "import { defineField, FieldType, RelationType } from 'twenty-sdk/define';",
    );
    expect(result).toContain('type: FieldType.RELATION');
    expect(result).toContain(
      "relationTargetObjectMetadataUniversalIdentifier: 'target-obj'",
    );
    expect(result).toContain(
      "relationTargetFieldMetadataUniversalIdentifier: 'target-field'",
    );
    expect(result).toContain(
      'universalSettings: { relationType: RelationType.ONE_TO_MANY }',
    );
    expect(result).not.toContain('morphId');
  });

  it('should include onDelete when provided for a RELATION field', () => {
    const result = getFieldBaseFile({
      data: {
        name: 'company',
        label: 'Company',
        type: 'RELATION' as any,
        objectUniversalIdentifier: 'obj-1',
        relationTargetObjectMetadataUniversalIdentifier: 'target-obj',
        relationTargetFieldMetadataUniversalIdentifier: 'target-field',
        relationType: 'ONE_TO_MANY' as any,
        onDelete: 'CASCADE' as any,
      },
      name: 'company',
    });

    expect(result).toContain(
      "import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';",
    );
    expect(result).toContain(
      'universalSettings: { relationType: RelationType.ONE_TO_MANY, onDelete: OnDeleteAction.CASCADE }',
    );
  });

  it('should omit onDelete when set to None for a RELATION field', () => {
    const result = getFieldBaseFile({
      data: {
        name: 'company',
        label: 'Company',
        type: 'RELATION' as any,
        objectUniversalIdentifier: 'obj-1',
        relationTargetObjectMetadataUniversalIdentifier: 'target-obj',
        relationTargetFieldMetadataUniversalIdentifier: 'target-field',
        relationType: 'ONE_TO_MANY' as any,
        onDelete: 'None',
      },
      name: 'company',
    });

    expect(result).not.toContain('onDelete');
    expect(result).not.toContain('OnDeleteAction');
  });

  it('should render a generated morphId for a MORPH_RELATION field', () => {
    const result = getFieldBaseFile({
      data: {
        name: 'target',
        label: 'Target',
        type: 'MORPH_RELATION' as any,
        objectUniversalIdentifier: 'obj-1',
        relationTargetObjectMetadataUniversalIdentifier: 'target-obj',
        relationTargetFieldMetadataUniversalIdentifier: 'target-field',
        relationType: 'MANY_TO_ONE' as any,
      },
      name: 'target',
    });

    expect(result).toContain('type: FieldType.MORPH_RELATION');
    expect(result).toMatch(
      /morphId: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'/,
    );
    expect(result).toContain(
      'universalSettings: { relationType: RelationType.MANY_TO_ONE }',
    );
  });
});
