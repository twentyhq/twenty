import { coerceLinksFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-links-field-or-throw.util';
import { CommonDataCoercerException } from 'src/engine/api/common/common-args-handlers/data-arg-handler/errors/common-data-coercer.exception';

describe('coerceLinksFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = coerceLinksFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return null when value is an empty object', () => {
      const result = coerceLinksFieldOrThrow({}, 'testField');

      expect(result).toBeNull();
    });

    it('should return transformed value when value has all fields including stringified secondaryLinks', () => {
      const result = coerceLinksFieldOrThrow(
        {
          primaryLinkUrl: 'HTTPS://PRIMARY.COM/',
          primaryLinkLabel: 'Primary',
          secondaryLinks:
            '[{"url":"HTTPS://SECONDARY.COM/","label":"Secondary"}]',
        },
        'testField',
      );

      expect(result).toEqual({
        primaryLinkUrl: 'https://primary.com',
        primaryLinkLabel: 'Primary',
        secondaryLinks: '[{"url":"https://secondary.com","label":"Secondary"}]',
      });
    });

    it('should return transformed value when value has all fields including secondaryLinks', () => {
      const result = coerceLinksFieldOrThrow(
        {
          primaryLinkUrl: 'HTTPS://PRIMARY.COM/',
          primaryLinkLabel: 'Primary',
          secondaryLinks: [
            { url: 'HTTPS://SECONDARY.COM/', label: 'Secondary' },
          ],
        },
        'testField',
      );

      expect(result).toEqual({
        primaryLinkUrl: 'https://primary.com',
        primaryLinkLabel: 'Primary',
        secondaryLinks: '[{"url":"https://secondary.com","label":"Secondary"}]',
      });
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() => coerceLinksFieldOrThrow(undefined, 'testField')).toThrow(
        CommonDataCoercerException,
      );
    });

    it('should throw when value is a string', () => {
      expect(() =>
        coerceLinksFieldOrThrow('https://example.com', 'testField'),
      ).toThrow(CommonDataCoercerException);
    });

    it('should throw when value has invalid subfields', () => {
      expect(() =>
        coerceLinksFieldOrThrow(
          {
            primaryLinkUrl: 'https://example.com',
            invalidField: 'value',
          },
          'testField',
        ),
      ).toThrow(CommonDataCoercerException);
    });
  });
});
