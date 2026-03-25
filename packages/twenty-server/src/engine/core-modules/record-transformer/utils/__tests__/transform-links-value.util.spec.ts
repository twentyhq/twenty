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

    it('should preserve percent-encoded payloads when normalizing imported URLs', () => {
      const input = {
        primaryLinkUrl:
          'https://www.google.com/maps/place/Birdie+-+Eventlocation/data=!4m7!3m6!1s0x479e7674e1702985:0xe482992505cb1ba4!8m2!3d48.1584971!4d11.5538261!16s%2Fg%2F1ptwh8096!19sChIJhSlw4XR2nkcRpBvLBSWZguQ?authuser=0&hl=en&rclk=1',
        primaryLinkLabel: 'Birdie',
        secondaryLinks: JSON.stringify([
          {
            url: 'https://example.com/test%2520name',
            label: 'Encoded secondary link',
          },
        ]),
      };

      const expected = {
        primaryLinkUrl:
          'https://www.google.com/maps/place/Birdie+-+Eventlocation/data=!4m7!3m6!1s0x479e7674e1702985:0xe482992505cb1ba4!8m2!3d48.1584971!4d11.5538261!16s%2Fg%2F1ptwh8096!19sChIJhSlw4XR2nkcRpBvLBSWZguQ?authuser=0&hl=en&rclk=1',
        primaryLinkLabel: 'Birdie',
        secondaryLinks: JSON.stringify([
          {
            url: 'https://example.com/test%2520name',
            label: 'Encoded secondary link',
          },
        ]),
      };

      expect(transformLinksValue(input)).toEqual(expected);
    });
  });
});
