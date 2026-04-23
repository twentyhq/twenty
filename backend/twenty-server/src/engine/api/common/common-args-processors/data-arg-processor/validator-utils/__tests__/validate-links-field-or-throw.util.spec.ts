import { validateLinksFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-links-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateLinksFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateLinksFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return the links object when all fields are valid', () => {
      const linksValue = {
        primaryLinkUrl: 'https://example.com',
        primaryLinkLabel: 'Example Website',
        secondaryLinks: [{ url: 'https://secondary.com', label: 'Secondary' }],
      };
      const result = validateLinksFieldOrThrow(linksValue, 'testField');

      expect(result).toEqual(linksValue);
    });

    it('should return the links object when only primaryLinkUrl is provided', () => {
      const linksValue = {
        primaryLinkUrl: 'https://example.com',
      };
      const result = validateLinksFieldOrThrow(linksValue, 'testField');

      expect(result).toEqual(linksValue);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is not an object', () => {
      expect(() =>
        validateLinksFieldOrThrow('not an object', 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is undefined', () => {
      expect(() => validateLinksFieldOrThrow(undefined, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when primaryLinkUrl is not a string', () => {
      const linksValue = {
        primaryLinkUrl: 12345,
      };

      expect(() => validateLinksFieldOrThrow(linksValue, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when primaryLinkLabel is not a string', () => {
      const linksValue = {
        primaryLinkLabel: ['not', 'a', 'string'],
      };

      expect(() => validateLinksFieldOrThrow(linksValue, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when secondaryLinks is not an object or null', () => {
      const linksValue = {
        secondaryLinks: 'not an object',
      };

      expect(() => validateLinksFieldOrThrow(linksValue, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when invalid subfields are present', () => {
      const linksValue = {
        primaryLinkUrl: 'https://example.com',
        invalidField1: 'invalid',
        invalidField2: 'invalid',
      };

      expect(() => validateLinksFieldOrThrow(linksValue, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });
  });
});
