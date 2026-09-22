import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';

describe('getDocumentationUrl', () => {
  it('returns the English page at the docs root without a locale', () => {
    expect(getDocumentationUrl({ path: '/user-guide/introduction' })).toBe(
      'https://docs.twenty.com/user-guide/introduction',
    );
  });

  it('keeps English at the docs root', () => {
    expect(
      getDocumentationUrl({
        locale: 'en-US',
        path: '/user-guide/introduction',
      }),
    ).toBe('https://docs.twenty.com/user-guide/introduction');
  });

  it('prefixes a supported locale with its language code folder', () => {
    expect(
      getDocumentationUrl({
        locale: 'fr-FR',
        path: '/user-guide/introduction',
      }),
    ).toBe('https://docs.twenty.com/fr/user-guide/introduction');
  });

  it('falls back to English for an unsupported locale', () => {
    expect(
      getDocumentationUrl({
        locale: 'sv-SE',
        path: '/user-guide/introduction',
      }),
    ).toBe('https://docs.twenty.com/user-guide/introduction');
  });
});
