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
      "import { defineField, FieldType } from 'twenty-sdk'",
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
});
