import { isHostnameOrSubdomainOf } from 'src/engine/core-modules/domain/domain-server-config/utils/is-hostname-or-subdomain-of.util';

describe('isHostnameOrSubdomainOf', () => {
  const domains = ['twenty.com', 'api.example.com', 'withtwenty.com'];

  it.each([
    { hostname: 'twenty.com', expected: true },
    { hostname: 'acme.twenty.com', expected: true },
    { hostname: 'api.example.com', expected: true },
    { hostname: 'API.Example.com.', expected: true },
    { hostname: 'withtwenty.com', expected: true },
    { hostname: 'acme.withtwenty.com', expected: true },
    { hostname: 'example.com', expected: false },
    { hostname: 'donate.charity.org', expected: false },
    { hostname: 'nottwenty.com', expected: false },
  ])('returns $expected for $hostname', ({ hostname, expected }) => {
    expect(isHostnameOrSubdomainOf({ hostname, domains })).toBe(expected);
  });

  it('ignores unset domains', () => {
    expect(
      isHostnameOrSubdomainOf({
        hostname: 'donate.charity.org',
        domains: [undefined, ''],
      }),
    ).toBe(false);
  });
});
