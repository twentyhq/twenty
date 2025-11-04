import { coerceRichTextV2FieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-rich-text-v2-field-or-throw.util';

// Mock transformRichTextV2Value to avoid blocknote dynamic import issues in tests
jest.mock(
  'src/engine/core-modules/record-transformer/utils/transform-rich-text-v2.util',
  () => ({
    transformRichTextV2Value: jest.fn((value) =>
      Promise.resolve({
        markdown: value.markdown || null,
        blocknote: value.blocknote || null,
      }),
    ),
  }),
);

describe('coerceRichTextV2FieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', async () => {
      const result = await coerceRichTextV2FieldOrThrow(null, 'description');

      expect(result).toBeNull();
    });

    it('should return null when value is an empty object', async () => {
      const result = await coerceRichTextV2FieldOrThrow({}, 'description');

      expect(result).toBeNull();
    });

    it('should return transformed value when value has markdown only', async () => {
      const richText = {
        markdown: '# Hello World',
      };
      const result = await coerceRichTextV2FieldOrThrow(
        richText,
        'description',
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty('markdown');
      expect(result).toHaveProperty('blocknote');
    });

    it('should return transformed value when value has blocknote only', async () => {
      const richText = {
        blocknote: JSON.stringify([
          {
            type: 'paragraph',
            content: 'Hello World',
          },
        ]),
        markdown: null,
      };
      const result = await coerceRichTextV2FieldOrThrow(
        richText,
        'description',
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty('markdown');
      expect(result).toHaveProperty('blocknote');
    });

    it('should return transformed value when value has both markdown and blocknote', async () => {
      const richText = {
        markdown: '# Hello World',
        blocknote: JSON.stringify([
          {
            type: 'heading',
            content: 'Hello World',
          },
        ]),
      };
      const result = await coerceRichTextV2FieldOrThrow(
        richText,
        'description',
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty('markdown');
      expect(result).toHaveProperty('blocknote');
    });

    it('should handle null values in subfields', async () => {
      const richText = {
        markdown: null,
        blocknote: null,
      };
      const result = await coerceRichTextV2FieldOrThrow(
        richText,
        'description',
      );

      expect(result).toBeDefined();
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', async () => {
      await expect(
        coerceRichTextV2FieldOrThrow(undefined, 'description'),
      ).rejects.toThrow(
        /Invalid value undefined for rich text v2 field "description"/,
      );
    });

    it('should throw when value is a string', async () => {
      await expect(
        coerceRichTextV2FieldOrThrow('# Hello World', 'description'),
      ).rejects.toThrow(
        /Invalid value '# Hello World' for rich text v2 field "description"/,
      );
    });

    it('should throw when value contains an invalid subfield name', async () => {
      const richText = {
        markdown: '# Hello World',
        invalidField: 'invalid',
      };

      await expect(
        coerceRichTextV2FieldOrThrow(richText, 'description'),
      ).rejects.toThrow(
        /Invalid value .* for rich text v2 field "description"/,
      );
    });
  });
});
