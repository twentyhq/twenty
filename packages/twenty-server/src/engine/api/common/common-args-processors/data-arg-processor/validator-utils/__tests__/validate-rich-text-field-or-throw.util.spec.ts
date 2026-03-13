import { validateRichTextFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-rich-text-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateRichTextFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateRichTextFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return null when value is an empty object', () => {
      const result = validateRichTextFieldOrThrow({}, 'testField');

      expect(result).toBeNull();
    });

    it('should return the value when it has valid subfields', () => {
      const value = {
        blocknote: 'some blocknote content',
        markdown: '# Heading\nContent',
      };
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
        /Should have only blocknote, markdown subfields/,
      );
    });
  });
});
