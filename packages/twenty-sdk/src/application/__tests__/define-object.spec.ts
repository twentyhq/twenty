import { defineObject } from '@/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { type ObjectManifest } from 'twenty-shared/application';

describe('defineObject', () => {
  const validConfig: ObjectManifest = {
    universalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
    nameSingular: 'postCard',
    namePlural: 'postCards',
    labelSingular: 'Post Card',
    labelPlural: 'Post Cards',
    icon: 'IconMail',
    fields: [
      {
        universalIdentifier: '58a0a314-d7ea-4865-9850-7fb84e72f30b',
        type: FieldMetadataType.TEXT,
        name: 'content',
        label: 'Content',
      },
    ],
  };

  it('should return the config when valid', () => {
    const result = defineObject(validConfig);

    expect(result).toEqual(validConfig);
  });

  it('should pass through all optional fields', () => {
    const config: ObjectManifest = {
      ...validConfig,
      description: 'A post card object',
    };

    const result = defineObject(config);

    expect(result.description).toBe('A post card object');
  });

  it('should throw error when universalIdentifier is missing', () => {
    const config = {
      ...validConfig,
      universalIdentifier: undefined,
    };

    expect(() => defineObject(config as any)).toThrow(
      'Object must have a universalIdentifier',
    );
  });

  it('should throw error when nameSingular is missing', () => {
    const config = {
      ...validConfig,
      nameSingular: undefined,
    };

    expect(() => defineObject(config as any)).toThrow(
      'Object must have a nameSingular',
    );
  });

  it('should throw error when namePlural is missing', () => {
    const config = {
      ...validConfig,
      namePlural: undefined,
    };

    expect(() => defineObject(config as any)).toThrow(
      'Object must have a namePlural',
    );
  });

  it('should throw error when labelSingular is missing', () => {
    const config = {
      ...validConfig,
      labelSingular: undefined,
    };

    expect(() => defineObject(config as any)).toThrow(
      'Object must have a labelSingular',
    );
  });

  it('should throw error when labelPlural is missing', () => {
    const config = {
      ...validConfig,
      labelPlural: undefined,
    };

    expect(() => defineObject(config as any)).toThrow(
      'Object must have a labelPlural',
    );
  });

  it('should accept empty fields array', () => {
    const config = {
      ...validConfig,
      fields: [],
    };

    const result = defineObject(config as any);

    expect(result.fields).toEqual([]);
  });

  it('should accept missing fields', () => {
    const config = {
      ...validConfig,
      fields: undefined,
    };

    const result = defineObject(config as any);

    expect(result.fields).toBeUndefined();
  });

  it('should throw error when field is missing label', () => {
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

    expect(() => defineObject(config as any)).toThrow(
      'Field must have a label',
    );
  });

  it('should throw error when field is missing name', () => {
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

    expect(() => defineObject(config as any)).toThrow(
      'Field "Content" must have a name',
    );
  });

  it('should throw error when field is missing universalIdentifier', () => {
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

    expect(() => defineObject(config as any)).toThrow(
      'Field "Content" must have a universalIdentifier',
    );
  });

  it('should throw error when SELECT field has no options', () => {
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

    expect(() => defineObject(config as any)).toThrow(
      'Field "Status" is a SELECT/MULTI_SELECT type and must have options',
    );
  });

  it('should throw error when MULTI_SELECT field has no options', () => {
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

    expect(() => defineObject(config as any)).toThrow(
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

    expect(result.fields[0].options).toHaveLength(2);
  });
});
