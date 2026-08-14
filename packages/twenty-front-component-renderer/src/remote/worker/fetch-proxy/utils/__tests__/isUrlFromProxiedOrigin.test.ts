import { isUrlFromProxiedOrigin } from '../isUrlFromProxiedOrigin';

describe('isUrlFromProxiedOrigin', () => {
  it('should return true when the url origin is in the proxied origins', () => {
    expect(
      isUrlFromProxiedOrigin('https://api.twenty.test/graphql', [
        'https://api.twenty.test',
      ]),
    ).toBe(true);
  });

  it('should return false when the origin differs', () => {
    expect(
      isUrlFromProxiedOrigin('https://evil.test/graphql', [
        'https://api.twenty.test',
      ]),
    ).toBe(false);
  });

  it('should return false when the url is malformed', () => {
    expect(
      isUrlFromProxiedOrigin('not a url', ['https://api.twenty.test']),
    ).toBe(false);
  });

  it('should match on origin regardless of path', () => {
    expect(
      isUrlFromProxiedOrigin(
        'https://api.twenty.test/rest/front-components/id',
        ['https://api.twenty.test'],
      ),
    ).toBe(true);
  });
});
