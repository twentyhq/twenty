import { isInstanceHostname } from 'src/engine/core-modules/domain/domain-server-config/utils/is-instance-hostname.util';

describe('isInstanceHostname', () => {
  const instanceHostnames = ['twenty.com', 'api.example.com', 'withtwenty.com'];

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
    expect(isInstanceHostname({ hostname, instanceHostnames })).toBe(expected);
  });

  it('ignores unset instance hostnames', () => {
    expect(
      isInstanceHostname({
        hostname: 'donate.charity.org',
        instanceHostnames: [undefined, ''],
      }),
    ).toBe(false);
  });
});
