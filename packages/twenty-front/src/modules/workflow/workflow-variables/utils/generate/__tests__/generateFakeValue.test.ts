import { generateFakeValue } from '@/workflow/workflow-variables/utils/generate/generateFakeValue';
import { FieldMetadataType } from 'twenty-shared/types';

describe('generateFakeValue', () => {
  describe('Primitive classification', () => {
    it('should generate string value', () => {
      const result = generateFakeValue('string', 'Primitive');

      expect(result).toBe('My text');
    });

    it('should generate number value', () => {
      const result = generateFakeValue('number', 'Primitive');

      expect(result).toBe(20);
    });

    it('should generate boolean value', () => {
      const result = generateFakeValue('boolean', 'Primitive');

      expect(result).toBe(true);
    });

    it('should generate Date value', () => {
      const result = generateFakeValue('Date', 'Primitive');

      expect(result).toBeInstanceOf(Date);
    });

    it('should generate array of strings', () => {
      const result = generateFakeValue('string[]', 'Primitive');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      expect((result as string[])[0]).toBe('My text');
    });

    it('should generate array of numbers', () => {
      const result = generateFakeValue('number[]', 'Primitive');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      expect((result as number[])[0]).toBe(20);
    });

    it('should generate object with properties', () => {
      const result = generateFakeValue(
        '{name: string; age: number}',
        'Primitive',
      ) as Record<string, any>;

      expect(result).toEqual({
        name: 'My text',
        age: 20,
      });
    });

    it('should return null for unknown primitive type', () => {
      const result = generateFakeValue('unknownType', 'Primitive');

      expect(result).toBeNull();
    });

    it('should use Primitive as default classification', () => {
      const result = generateFakeValue('string');

      expect(result).toBe('My text');
    });
  });

  describe('FieldMetadataType classification', () => {
    it('should generate TEXT value', () => {
      const result = generateFakeValue(
        FieldMetadataType.TEXT,
        'FieldMetadataType',
      );

      expect(result).toBe('My text');
    });

    it('should generate NUMBER value', () => {
      const result = generateFakeValue(
        FieldMetadataType.NUMBER,
        'FieldMetadataType',
      );

      expect(result).toBe(20);
    });

    it('should generate BOOLEAN value', () => {
      const result = generateFakeValue(
        FieldMetadataType.BOOLEAN,
        'FieldMetadataType',
      );

      expect(result).toBe(true);
    });

    it('should generate DATE value', () => {
      const result = generateFakeValue(
        FieldMetadataType.DATE,
        'FieldMetadataType',
      );

      expect(result).toBe('01/23/2025');
    });

    it('should generate DATE_TIME value', () => {
      const result = generateFakeValue(
        FieldMetadataType.DATE_TIME,
        'FieldMetadataType',
      );

      expect(result).toBe('01/23/2025 15:16');
    });

    it('should generate ADDRESS value', () => {
      const result = generateFakeValue(
        FieldMetadataType.ADDRESS,
        'FieldMetadataType',
      );

      expect(result).toBe('123 Main St, Anytown, CA 12345');
    });

    it('should generate FULL_NAME value', () => {
      const result = generateFakeValue(
        FieldMetadataType.FULL_NAME,
        'FieldMetadataType',
      );

      expect(result).toBe('Tim Cook');
    });

    it('should generate RAW_JSON value as null', () => {
      const result = generateFakeValue(
        FieldMetadataType.RAW_JSON,
        'FieldMetadataType',
      );

      expect(result).toBeNull();
    });

    it('should generate RICH_TEXT value', () => {
      const result = generateFakeValue(
        FieldMetadataType.RICH_TEXT,
        'FieldMetadataType',
      );

      expect(result).toBe('My rich text');
    });

    it('should generate UUID value', () => {
      const result = generateFakeValue(
        FieldMetadataType.UUID,
        'FieldMetadataType',
      );

      expect(result).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should return null for unknown FieldMetadataType', () => {
      const result = generateFakeValue('UNKNOWN_TYPE', 'FieldMetadataType');

      expect(result).toBeNull();
    });

    it.each([
      FieldMetadataType.CURRENCY,
      FieldMetadataType.LINKS,
      FieldMetadataType.PHONES,
      FieldMetadataType.EMAILS,
      FieldMetadataType.RATING,
      FieldMetadataType.SELECT,
      FieldMetadataType.MULTI_SELECT,
      FieldMetadataType.ARRAY,
      FieldMetadataType.RELATION,
      FieldMetadataType.ACTOR,
    ])(
      'should return null for unsupported FieldMetadataType %s',
      (fieldType) => {
        const result = generateFakeValue(fieldType, 'FieldMetadataType');

        expect(result).toBeNull();
      },
    );
  });

  describe('Unknown classification', () => {
    it('should return null for unknown classification', () => {
      const result = generateFakeValue('string', 'Unknown' as any);

      expect(result).toBeNull();
    });
  });
});
