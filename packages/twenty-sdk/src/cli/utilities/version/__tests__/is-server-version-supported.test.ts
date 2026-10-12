import { isServerVersionSupported } from '@/cli/utilities/version/is-server-version-supported';

describe('isServerVersionSupported', () => {
  it('accepts a server version inside the supported range', () => {
    expect(
      isServerVersionSupported({
        serverVersion: '2.47.0',
        supportedServerVersionRange: '>=2.47.0',
      }),
    ).toBe(true);
  });

  it('rejects a server version below the supported range', () => {
    expect(
      isServerVersionSupported({
        serverVersion: '2.46.3',
        supportedServerVersionRange: '>=2.47.0',
      }),
    ).toBe(false);
  });

  it('rejects a server version above a bounded range', () => {
    expect(
      isServerVersionSupported({
        serverVersion: '3.0.0',
        supportedServerVersionRange: '^2.47.0',
      }),
    ).toBe(false);
  });

  it('does not block a server that cannot resolve its version', () => {
    expect(
      isServerVersionSupported({
        serverVersion: null,
        supportedServerVersionRange: '>=2.47.0',
      }),
    ).toBe(true);
  });

  it('does not block a server version that is not valid semver', () => {
    expect(
      isServerVersionSupported({
        serverVersion: 'unknown',
        supportedServerVersionRange: '>=2.47.0',
      }),
    ).toBe(true);
  });
});
