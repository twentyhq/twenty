import { RecordTransformerExceptionCode } from 'src/engine/core-modules/record-transformer/record-transformer.exception';
import { transformLinksValue } from 'src/engine/core-modules/record-transformer/utils/transform-links-value.util';

describe('transformLinksValue', () => {
  it('should handle null/undefined/empty object values', () => {
    expect(transformLinksValue({ input: null })).toBeNull();
    expect(transformLinksValue({ input: undefined })).toBeUndefined();
    expect(transformLinksValue({ input: {} })).toEqual({});
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

      expect(transformLinksValue({ input })).toEqual(expected);
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

      expect(transformLinksValue({ input })).toEqual(expected);
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

      expect(transformLinksValue({ input })).toEqual(expected);
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

      expect(transformLinksValue({ input })).toEqual(expected);
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

      expect(transformLinksValue({ input })).toEqual(expected);
    });
  });

  // A subfield left out of the input keeps its stored value, so every
  // assertion here is about which keys come back, not only their values.
  describe('partial update', () => {
    it('should leave the url and the secondary links alone when only the label is sent', () => {
      expect(
        transformLinksValue({ input: { primaryLinkLabel: 'Example' } }),
      ).toEqual({ primaryLinkLabel: 'Example' });
    });

    it('should leave the label and the secondary links alone when only the url is sent', () => {
      expect(
        transformLinksValue({
          input: { primaryLinkUrl: 'HTTPS://EXAMPLE.COM/' },
        }),
      ).toEqual({ primaryLinkUrl: 'https://example.com' });
    });

    it('should not promote a secondary link to primary when only the secondary links are sent', () => {
      expect(
        transformLinksValue({
          input: {
            secondaryLinks: JSON.stringify([
              { url: 'https://docs.twenty.com', label: 'Documentation' },
            ]),
          },
        }),
      ).toEqual({
        secondaryLinks: JSON.stringify([
          { url: 'https://docs.twenty.com', label: 'Documentation' },
        ]),
      });
    });

    it('should clear the label along with the url, and still leave the secondary links alone', () => {
      expect(transformLinksValue({ input: { primaryLinkUrl: '' } })).toEqual({
        primaryLinkUrl: null,
        primaryLinkLabel: null,
      });
    });

    it('should drop a label that was sent together with an emptied url', () => {
      expect(
        transformLinksValue({
          input: { primaryLinkUrl: null, primaryLinkLabel: 'Example' },
        }),
      ).toEqual({
        primaryLinkUrl: null,
        primaryLinkLabel: null,
      });
    });

    it('should null the secondary links when the only ones sent are empty', () => {
      expect(
        transformLinksValue({
          input: {
            secondaryLinks: JSON.stringify([{ url: '', label: 'Empty' }]),
          },
        }),
      ).toEqual({ secondaryLinks: null });
    });

    it('should still reject an invalid url', () => {
      expect(() =>
        transformLinksValue({ input: { primaryLinkUrl: 'lydia,com' } }),
      ).toThrow(
        expect.objectContaining({
          code: RecordTransformerExceptionCode.INVALID_URL,
        }),
      );

      expect(() =>
        transformLinksValue({
          input: { secondaryLinks: JSON.stringify([{ url: 'wikipedia' }]) },
        }),
      ).toThrow(
        expect.objectContaining({
          code: RecordTransformerExceptionCode.INVALID_URL,
        }),
      );
    });

    it('should normalize with the field variant', () => {
      expect(
        transformLinksValue({
          input: {
            secondaryLinks: JSON.stringify([
              { url: 'https://www.example-old.com/about', label: 'Old domain' },
            ]),
          },
          settings: { type: 'domain' },
        }),
      ).toEqual({
        secondaryLinks: JSON.stringify([
          { url: 'example-old.com', label: 'Old domain' },
        ]),
      });
    });
  });

  describe('url-typed field', () => {
    it('should keep the whole url, exactly like a field with no variant set', () => {
      const input = {
        primaryLinkUrl: 'HTTPS://WWW.EXAMPLE.COM/careers?utm=1',
        primaryLinkLabel: 'Example',
        secondaryLinks: null,
      };

      expect(transformLinksValue({ input, settings: { type: 'url' } })).toEqual(
        transformLinksValue({ input }),
      );
      expect(
        transformLinksValue({ input, settings: { type: 'url' } })
          ?.primaryLinkUrl,
      ).toBe('https://www.example.com/careers?utm=1');
    });
  });

  describe('domain-typed field', () => {
    const settings = { type: 'domain' } as const;

    it('should reduce every spelling of a domain to the same value', () => {
      const spellings = [
        'example.com',
        'www.example.com',
        'HTTPS://WWW.EXAMPLE.COM/',
        'http://example.com/careers?utm=1',
      ];

      const normalized = spellings.map(
        (primaryLinkUrl) =>
          transformLinksValue({
            input: { primaryLinkUrl, primaryLinkLabel: 'Example' },
            settings,
          })?.primaryLinkUrl,
      );

      expect(normalized).toEqual([
        'example.com',
        'example.com',
        'example.com',
        'example.com',
      ]);
    });

    it('should reduce secondary links to bare domains', () => {
      const input = {
        primaryLinkUrl: 'https://example.com',
        primaryLinkLabel: 'Example',
        secondaryLinks: JSON.stringify([
          { url: 'https://www.example-old.com/about', label: 'Old domain' },
        ]),
      };

      expect(transformLinksValue({ input, settings })).toEqual({
        primaryLinkUrl: 'example.com',
        primaryLinkLabel: 'Example',
        secondaryLinks: JSON.stringify([
          { url: 'example-old.com', label: 'Old domain' },
        ]),
      });
    });
  });
});
