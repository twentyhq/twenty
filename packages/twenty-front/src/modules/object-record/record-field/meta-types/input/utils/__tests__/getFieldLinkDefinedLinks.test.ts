import { getFieldLinkDefinedLinks } from '../getFieldLinkDefinedLinks';

describe('getFieldLinkDefinedLinks', () => {
  describe('Primary link', () => {
    it('should not return primary link when primaryLinkUrl is null', () => {
      expect(
        getFieldLinkDefinedLinks({
          primaryLinkUrl: null,
          primaryLinkLabel: 'Twenty',
          secondaryLinks: [],
        }),
      ).toEqual([]);
    });

    it('should not return primary link when primaryLinkUrl is empty string', () => {
      expect(
        getFieldLinkDefinedLinks({
          primaryLinkUrl: '',
          primaryLinkLabel: 'Twenty',
          secondaryLinks: [],
        }),
      ).toEqual([]);
    });

    it('should return primary link when primaryLinkUrl is defined but primaryLinkLabel is null', () => {
      expect(
        getFieldLinkDefinedLinks({
          primaryLinkUrl: 'https://twenty.com',
          primaryLinkLabel: null,
          secondaryLinks: [],
        }),
      ).toEqual([
        {
          url: 'https://twenty.com',
          label: null,
        },
      ]);
    });
  });

  describe('Secondary links', () => {
    it('should handle null secondaryLinks', () => {
      expect(
        getFieldLinkDefinedLinks({
          primaryLinkUrl: '',
          primaryLinkLabel: '',
          secondaryLinks: null,
        }),
      ).toEqual([]);
    });

    it('should filter out secondary links with null url', () => {
      expect(
        getFieldLinkDefinedLinks({
          primaryLinkUrl: '',
          primaryLinkLabel: '',
          secondaryLinks: [
            {
              url: null,
              label: 'Twenty',
            },
            {
              url: 'https://docs.twenty.com',
              label: 'Documentation',
            },
          ],
        }),
      ).toEqual([
        {
          url: 'https://docs.twenty.com',
          label: 'Documentation',
        },
      ]);
    });

    it('should filter out secondary links with empty url', () => {
      expect(
        getFieldLinkDefinedLinks({
          primaryLinkUrl: '',
          primaryLinkLabel: '',
          secondaryLinks: [
            {
              url: '',
              label: 'Twenty',
            },
            {
              url: 'https://docs.twenty.com',
              label: 'Documentation',
            },
          ],
        }),
      ).toEqual([
        {
          url: 'https://docs.twenty.com',
          label: 'Documentation',
        },
      ]);
    });

    it('should keep secondary links with null label if url is defined', () => {
      expect(
        getFieldLinkDefinedLinks({
          primaryLinkUrl: '',
          primaryLinkLabel: '',
          secondaryLinks: [
            {
              url: 'https://twenty.com',
              label: null,
            },
          ],
        }),
      ).toEqual([
        {
          url: 'https://twenty.com',
          label: null,
        },
      ]);
    });

    it('should correctly combine primary and secondary links with edge cases', () => {
      expect(
        getFieldLinkDefinedLinks({
          primaryLinkUrl: 'https://twenty.com',
          primaryLinkLabel: null,
          secondaryLinks: [
            {
              url: '',
              label: 'Invalid Link',
            },
            {
              url: 'https://docs.twenty.com',
              label: null,
            },
            {
              url: null,
              label: 'Another Invalid Link',
            },
          ],
        }),
      ).toEqual([
        {
          url: 'https://twenty.com',
          label: null,
        },
        {
          url: 'https://docs.twenty.com',
          label: null,
        },
      ]);
    });

    it('should handle empty secondaryLinks array', () => {
      expect(
        getFieldLinkDefinedLinks({
          primaryLinkUrl: '',
          primaryLinkLabel: '',
          secondaryLinks: [],
        }),
      ).toEqual([]);
    });
  });
});
