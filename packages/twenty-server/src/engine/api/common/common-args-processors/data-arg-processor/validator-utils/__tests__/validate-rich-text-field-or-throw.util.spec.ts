import { validateRichTextFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-rich-text-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateRichTextFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateRichTextFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return value when value is an empty object', () => {
      const result = validateRichTextFieldOrThrow({}, 'testField');

      expect(result).toEqual({});
    });

    it('should return the value when it has valid subfields', () => {
      const value = {
        blocknote:
          '[{"type":"paragraph","content":[{"type":"text","text":"test"}]}]',
        markdown: '# Heading\nContent',
      };
      const result = validateRichTextFieldOrThrow(value, 'testField');

      expect(result).toEqual(value);
    });

    it('should return the value when blocknote is null', () => {
      const value = { blocknote: null, markdown: 'test' };
      const result = validateRichTextFieldOrThrow(value, 'testField');

      expect(result).toEqual(value);
    });

    it('should return the value when only markdown is provided', () => {
      const value = { markdown: '# Heading' };
      const result = validateRichTextFieldOrThrow(value, 'testField');

      expect(result).toEqual(value);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() =>
        validateRichTextFieldOrThrow(undefined, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is a string', () => {
      expect(() =>
        validateRichTextFieldOrThrow('not an object', 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value has invalid subfields', () => {
      const value = { invalidField: 'value' };

      expect(() => validateRichTextFieldOrThrow(value, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
      expect(() => validateRichTextFieldOrThrow(value, 'testField')).toThrow(
        /Invalid subfield.*invalidField.*rich text field/,
      );
    });

    it('should throw when blocknote contains invalid JSON', () => {
      const value = { blocknote: 'not-valid-json' };

      expect(() => validateRichTextFieldOrThrow(value, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
      expect(() => validateRichTextFieldOrThrow(value, 'testField')).toThrow(
        /must contain valid JSON/,
      );
    });

    it('should throw when blocknote is valid JSON but not an array', () => {
      const value = { blocknote: '{"type":"paragraph"}' };

      expect(() => validateRichTextFieldOrThrow(value, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
      expect(() => validateRichTextFieldOrThrow(value, 'testField')).toThrow(
        /must be a JSON array of blocks/,
      );
    });
  });
});
