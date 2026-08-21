import { resolveHostFetchRedirectMode } from '../resolveHostFetchRedirectMode';

const componentUrl = 'https://api.twenty.test/rest/front-components/id';
const fileStorageRedirectableUrls = new Set([componentUrl]);

describe('resolveHostFetchRedirectMode', () => {
  it('should follow redirects for GET and HEAD requests to redirectable urls', () => {
    expect(
      resolveHostFetchRedirectMode(
        'GET',
        componentUrl,
        fileStorageRedirectableUrls,
      ),
    ).toBe('follow');
    expect(
      resolveHostFetchRedirectMode(
        'HEAD',
        componentUrl,
        fileStorageRedirectableUrls,
      ),
    ).toBe('follow');
  });

  it('should refuse redirects for mutating requests to redirectable urls', () => {
    expect(
      resolveHostFetchRedirectMode(
        'POST',
        componentUrl,
        fileStorageRedirectableUrls,
      ),
    ).toBe('error');
  });

  it('should refuse redirects for GET requests to non redirectable urls', () => {
    expect(
      resolveHostFetchRedirectMode(
        'GET',
        'https://api.twenty.test/graphql',
        fileStorageRedirectableUrls,
      ),
    ).toBe('error');
  });
});
