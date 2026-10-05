import { validateLinksFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-links-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateLinksFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateLinksFieldOrThrow({
        value: null,
        fieldName: 'testField',
      });

      expect(result).toBeNull();
    });

    it('should return the links object when all fields are valid', () => {
      const linksValue = {
        primaryLinkUrl: 'https://example.com',
        primaryLinkLabel: 'Example Website',
        secondaryLinks: [{ url: 'https://secondary.com', label: 'Secondary' }],
      };
      const result = validateLinksFieldOrThrow({
        value: linksValue,
        fieldName: 'testField',
      });

      expect(result).toEqual(linksValue);
    });

    it('should return the links object when only primaryLinkUrl is provided', () => {
      const linksValue = {
        primaryLinkUrl: 'https://example.com',
      };
      const result = validateLinksFieldOrThrow({
        value: linksValue,
        fieldName: 'testField',
      });

      expect(result).toEqual(linksValue);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is not an object', () => {
      expect(() =>
        validateLinksFieldOrThrow({
          value: 'not an object',
          fieldName: 'testField',
        }),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is undefined', () => {
      expect(() =>
        validateLinksFieldOrThrow({ value: undefined, fieldName: 'testField' }),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when primaryLinkUrl is not a string', () => {
      const linksValue = {
        primaryLinkUrl: 12345,
      };

      expect(() =>
        validateLinksFieldOrThrow({
          value: linksValue,
          fieldName: 'testField',
        }),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when primaryLinkLabel is not a string', () => {
      const linksValue = {
        primaryLinkLabel: ['not', 'a', 'string'],
      };

      expect(() =>
        validateLinksFieldOrThrow({
          value: linksValue,
          fieldName: 'testField',
        }),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when secondaryLinks is not an object or null', () => {
      const linksValue = {
        secondaryLinks: 'not an object',
      };

      expect(() =>
        validateLinksFieldOrThrow({
          value: linksValue,
          fieldName: 'testField',
        }),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when invalid subfields are present', () => {
      const linksValue = {
        primaryLinkUrl: 'https://example.com',
        invalidField1: 'invalid',
        invalidField2: 'invalid',
      };

      expect(() =>
        validateLinksFieldOrThrow({
          value: linksValue,
          fieldName: 'testField',
        }),
      ).toThrow(CommonQueryRunnerException);
    });
  });

  describe('domain-typed field', () => {
    const validateDomain = (value: unknown) =>
      validateLinksFieldOrThrow({
        value,
        fieldName: 'domainName',
        linksVariant: 'domain',
      });

    it.each([
      'twenty.com',
      'https://www.twenty.com/careers?x=1',
      'münchen.de',
      'blog.twenty.com',
    ])('should accept %s, which names a real host', (primaryLinkUrl) => {
      expect(() => validateDomain({ primaryLinkUrl })).not.toThrow();
    });

    it.each([
      'not a domain',
      'javascript:alert(1)',
      'twenty',
      '<script>',
      'localhost',
      '192.168.1.1',
    ])('should reject %s, which is not a domain', (primaryLinkUrl) => {
      expect(() => validateDomain({ primaryLinkUrl })).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should reject a secondary link that is not a domain', () => {
      expect(() =>
        validateDomain({
          primaryLinkUrl: 'twenty.com',
          secondaryLinks: [{ url: 'not a domain', label: '' }],
        }),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should let an empty domain through, so clearing the field still works', () => {
      expect(() => validateDomain({ primaryLinkUrl: '' })).not.toThrow();
    });

    it('should leave a url-typed field free to hold any url', () => {
      expect(() =>
        validateLinksFieldOrThrow({
          value: { primaryLinkUrl: 'https://twenty.com/a/b?c=d' },
          fieldName: 'website',
          linksVariant: 'url',
        }),
      ).not.toThrow();
    });
  });
});
