import { validateRichTextV2FieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-rich-text-v2-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateRichTextV2FieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateRichTextV2FieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return null when value is an empty object', () => {
      const result = validateRichTextV2FieldOrThrow({}, 'testField');

      expect(result).toBeNull();
    });

    it('should return the value when it has valid subfields', () => {
      const value = {
        blocknote: 'some blocknote content',
        markdown: '# Heading\nContent',
      };
      const result = validateRichTextV2FieldOrThrow(value, 'testField');

      expect(result).toEqual(value);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() =>
        validateRichTextV2FieldOrThrow(undefined, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is a string', () => {
      expect(() =>
        validateRichTextV2FieldOrThrow('not an object', 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value has invalid subfields', () => {
      const value = { invalidField: 'value' };

      expect(() => validateRichTextV2FieldOrThrow(value, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
      expect(() => validateRichTextV2FieldOrThrow(value, 'testField')).toThrow(
        /Should have only blocknote, markdown subfields/,
      );
    });
  });
});
