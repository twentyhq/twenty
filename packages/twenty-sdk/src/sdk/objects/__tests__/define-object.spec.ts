import { defineObject } from '@/sdk';
import { type ObjectManifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

describe('defineObject', () => {
  const validConfig: ObjectManifest = {
    universalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
    nameSingular: 'postCard',
    namePlural: 'postCards',
    labelSingular: 'Post Card',
    labelPlural: 'Post Cards',
    icon: 'IconMail',
    labelIdentifierFieldMetadataUniversalIdentifier:
      '58a0a314-d7ea-4865-9850-7fb84e72f30b',
    fields: [
      {
        universalIdentifier: '58a0a314-d7ea-4865-9850-7fb84e72f30b',
        type: FieldMetadataType.TEXT,
        name: 'content',
        label: 'Content',
      },
    ],
  };

  it('should return successful validation result when valid', () => {
    const result = defineObject(validConfig);

    expect(result.success).toBe(true);
    expect(result.config).toEqual(validConfig);
    expect(result.errors).toEqual([]);
  });

  it('should pass through all optional fields', () => {
    const config: ObjectManifest = {
      ...validConfig,
      description: 'A post card object',
    };

    const result = defineObject(config);

    expect(result.success).toBe(true);
    expect(result.config?.description).toBe('A post card object');
  });

  it('should return error when universalIdentifier is missing', () => {
    const config = {
      ...validConfig,
      universalIdentifier: undefined,
    };

    const result = defineObject(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Object must have a universalIdentifier');
  });

  it('should return error when nameSingular is missing', () => {
    const config = {
      ...validConfig,
      nameSingular: undefined,
    };

    const result = defineObject(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Object must have a nameSingular');
  });

  it('should return error when namePlural is missing', () => {
    const config = {
      ...validConfig,
      namePlural: undefined,
    };

    const result = defineObject(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Object must have a namePlural');
  });

  it('should return error when labelSingular is missing', () => {
    const config = {
      ...validConfig,
      labelSingular: undefined,
    };

    const result = defineObject(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Object must have a labelSingular');
  });

  it('should return error when labelPlural is missing', () => {
    const config = {
      ...validConfig,
      labelPlural: undefined,
    };

    const result = defineObject(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Object must have a labelPlural');
  });

  it('should accept empty fields array', () => {
    const config = {
      ...validConfig,
      fields: [],
    };

    const result = defineObject(config as any);

    expect(result.config.fields).toEqual([]);
  });

  it('should return error when field is missing label', () => {
    const config = {
      ...validConfig,
      fields: [
        {
          universalIdentifier: '58a0a314-d7ea-4865-9850-7fb84e72f30b',
          type: FieldMetadataType.TEXT,
          name: 'content',
        },
      ],
    };

    const result = defineObject(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Field must have a label');
  });

  it('should return error when field is missing name', () => {
    const config = {
      ...validConfig,
      fields: [
        {
          universalIdentifier: '58a0a314-d7ea-4865-9850-7fb84e72f30b',
          type: FieldMetadataType.TEXT,
          label: 'Content',
        },
      ],
    };

    const result = defineObject(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Field "Content" must have a name');
  });

  it('should return error when field is missing universalIdentifier', () => {
    const config = {
      ...validConfig,
      fields: [
        {
          type: FieldMetadataType.TEXT,
          name: 'content',
          label: 'Content',
        },
      ],
    };
    const result = defineObject(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Field "Content" must have a universalIdentifier',
    );
  });

  it('should return error when SELECT field has no options', () => {
    const config = {
      ...validConfig,
      fields: [
        {
          universalIdentifier: '58a0a314-d7ea-4865-9850-7fb84e72f30b',
          type: FieldMetadataType.SELECT,
          label: 'Status',
          name: 'status',
        },
      ],
    };
    const result = defineObject(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Field "Status" is a SELECT/MULTI_SELECT type and must have options',
    );
  });

  it('should return error when MULTI_SELECT field has no options', () => {
    const config = {
      ...validConfig,
      fields: [
        {
          universalIdentifier: '58a0a314-d7ea-4865-9850-7fb84e72f30b',
          type: FieldMetadataType.MULTI_SELECT,
          label: 'Tags',
          name: 'tag',
        },
      ],
    };

    const result = defineObject(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Field "Tags" is a SELECT/MULTI_SELECT type and must have options',
    );
  });

  it('should accept SELECT field with options', () => {
    const config = {
      ...validConfig,
      fields: [
        {
          universalIdentifier: '58a0a314-d7ea-4865-9850-7fb84e72f30b',
          type: FieldMetadataType.SELECT,
          name: 'status',
          label: 'Status',
          options: [
            { value: 'draft', label: 'Draft', color: 'gray', position: 0 },
            { value: 'sent', label: 'Sent', color: 'green', position: 1 },
          ],
        },
      ],
    };

    const result = defineObject(config as any);

    expect(result.config.fields[0].options).toHaveLength(2);
  });

  it('should return error when labelIdentifierFieldMetadataUniversalIdentifier references non-existent field', () => {
    const config: ObjectManifest = {
      ...validConfig,
      labelIdentifierFieldMetadataUniversalIdentifier:
        'non-existent-field-uuid',
    };

    const result = defineObject(config);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'labelIdentifierFieldMetadataUniversalIdentifier must reference a field defined in the fields array',
    );
  });
});
