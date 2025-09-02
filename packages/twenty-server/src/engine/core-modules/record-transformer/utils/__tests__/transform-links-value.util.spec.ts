import { transformLinksValue } from 'src/engine/core-modules/record-transformer/utils/transform-links-value.util';

describe('transformLinksValue', () => {
  it('should handle null/undefined/empty object values', () => {
    expect(transformLinksValue(null)).toBeNull();
    expect(transformLinksValue(undefined)).toBeUndefined();
    expect(transformLinksValue({})).toEqual({
      primaryLinkLabel: null,
      primaryLinkUrl: null,
      secondaryLinks: null,
    });
  });

  describe('primary link', () => {
    it('should transform uppercase', () => {
      const input = {
        primaryLinkUrl: 'HTTPS://EXAMPLE.COM',
        primaryLinkLabel: 'Example',
        secondaryLinks: null,
      };

      const expected = {
        primaryLinkUrl: 'https://example.com',
        primaryLinkLabel: 'Example',
        secondaryLinks: null,
      };

      expect(transformLinksValue(input)).toEqual(expected);
    });

    it('should remove trailing slash', () => {
      const input = {
        primaryLinkUrl: 'https://example.com/',
        primaryLinkLabel: 'Example',
        secondaryLinks: null,
      };

      const expected = {
        primaryLinkUrl: 'https://example.com',
        primaryLinkLabel: 'Example',
        secondaryLinks: null,
      };

      expect(transformLinksValue(input)).toEqual(expected);
    });

    it('should work fine without protocol', () => {
      const input = {
        primaryLinkUrl: 'example.com',
        primaryLinkLabel: 'Example',
        secondaryLinks: null,
      };

      const expected = {
        primaryLinkUrl: 'example.com',
        primaryLinkLabel: 'Example',
        secondaryLinks: null,
      };

      expect(transformLinksValue(input)).toEqual(expected);
    });

    it('should work fine with www', () => {
      const input = {
        primaryLinkUrl: 'www.example.com',
        primaryLinkLabel: 'Example',
        secondaryLinks: null,
      };

      const expected = {
        primaryLinkUrl: 'www.example.com',
        primaryLinkLabel: 'Example',
        secondaryLinks: null,
      };

      expect(transformLinksValue(input)).toEqual(expected);
    });
  });
});
