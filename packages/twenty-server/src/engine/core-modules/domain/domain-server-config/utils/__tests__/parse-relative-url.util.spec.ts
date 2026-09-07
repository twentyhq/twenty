import { buildUrlWithPathnameAndSearchParams } from 'src/engine/core-modules/domain/domain-server-config/utils/build-url-with-pathname-and-search-params.util';
import { parseRelativeUrl } from 'src/engine/core-modules/domain/domain-server-config/utils/parse-relative-url.util';

describe('parseRelativeUrl', () => {
  it('parses a plain pathname', () => {
    expect(parseRelativeUrl('/settings/accounts')).toEqual({
      pathname: '/settings/accounts',
      searchParams: {},
      hash: '',
    });
  });

  it('splits a tab anchor out of the pathname', () => {
    expect(
      parseRelativeUrl(
        '/object/company/46d9f704-ee56-4063-835b-ffb3aea3c544#630fec80-dc2d-400b-b760-f8d9b7402cac',
      ),
    ).toEqual({
      pathname: '/object/company/46d9f704-ee56-4063-835b-ffb3aea3c544',
      searchParams: {},
      hash: '#630fec80-dc2d-400b-b760-f8d9b7402cac',
    });
  });

  it('splits a query string and a hash out of the pathname', () => {
    expect(
      parseRelativeUrl('/objects/companies?viewId=view-1&page=2#tab-1'),
    ).toEqual({
      pathname: '/objects/companies',
      searchParams: { viewId: 'view-1', page: '2' },
      hash: '#tab-1',
    });
  });

  it('keeps only the path, query and hash of an absolute url', () => {
    expect(parseRelativeUrl('https://evil.com/phishing?a=1#target')).toEqual({
      pathname: '/phishing',
      searchParams: { a: '1' },
      hash: '#target',
    });
  });

  it('keeps only the path of a protocol-relative url', () => {
    expect(parseRelativeUrl('//evil.com/phishing')).toEqual({
      pathname: '/phishing',
      searchParams: {},
      hash: '',
    });
  });

  it('rebuilds into a url without percent-encoding the separators', () => {
    const url = buildUrlWithPathnameAndSearchParams({
      baseUrl: new URL('https://acme.twenty.com'),
      ...parseRelativeUrl(
        '/object/company/46d9f704-ee56-4063-835b-ffb3aea3c544#630fec80-dc2d-400b-b760-f8d9b7402cac',
      ),
    });

    expect(url.toString()).toBe(
      'https://acme.twenty.com/object/company/46d9f704-ee56-4063-835b-ffb3aea3c544#630fec80-dc2d-400b-b760-f8d9b7402cac',
    );
  });
});
