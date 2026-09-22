import { ApplicationHealthStatus } from '~/generated-metadata/graphql';
import { getApplicationHealthBanner } from '~/pages/settings/applications/utils/getApplicationHealthBanner';

const FALLBACK_LOCATION = '/settings/applications/app-id#variables';

// Assembled rather than written out, since oxlint rejects a script url literal.
const SCRIPT_URL = ['java', 'script:alert(1)'].join('');

const buildResult = (
  overrides: Partial<{
    status: ApplicationHealthStatus;
    message: string | null;
    action: { label: string; location?: string | null } | null;
  }> = {},
) => ({
  __typename: 'ApplicationHealthCheckResult' as const,
  status: ApplicationHealthStatus.ERROR,
  message: 'Your key was revoked',
  action: null,
  ...overrides,
});

describe('getApplicationHealthBanner', () => {
  it('should return nothing when there is no result', () => {
    expect(
      getApplicationHealthBanner({ healthCheckResult: null }),
    ).toBeUndefined();
  });

  it('should return nothing when the result carries no message', () => {
    expect(
      getApplicationHealthBanner({
        healthCheckResult: buildResult({ message: null }),
      }),
    ).toBeUndefined();
  });

  it('should send the action to the location reported by the app', () => {
    expect(
      getApplicationHealthBanner({
        healthCheckResult: buildResult({
          action: { label: 'Add credits', location: '/settings/billing' },
        }),
      })?.action,
    ).toEqual({ label: 'Add credits', to: '/settings/billing' });
  });

  it('should keep the hash the app reported so it can point at a tab', () => {
    expect(
      getApplicationHealthBanner({
        healthCheckResult: buildResult({
          action: {
            label: 'Reconnect',
            location: '/settings/applications/app-id#variables',
          },
        }),
      })?.action?.to,
    ).toBe('/settings/applications/app-id#variables');
  });

  it('should keep a hash-only location, which moves to a tab on the current page', () => {
    expect(
      getApplicationHealthBanner({
        healthCheckResult: buildResult({
          action: { label: 'Configure', location: '#variables' },
        }),
        fallbackLocation: FALLBACK_LOCATION,
      })?.action,
    ).toEqual({ label: 'Configure', to: '#variables' });
  });

  it("should fall back to the app's configuration tab when it reports no location", () => {
    expect(
      getApplicationHealthBanner({
        healthCheckResult: buildResult({ action: { label: 'Configure' } }),
        fallbackLocation: FALLBACK_LOCATION,
      })?.action,
    ).toEqual({ label: 'Configure', to: FALLBACK_LOCATION });
  });

  it.each([
    ['an absolute url', 'https://evil.example.com'],
    ['a protocol-relative url', '//evil.example.com'],
    ['a script url', SCRIPT_URL],
    ['a relative path', 'settings/billing'],
  ])('should drop the action when the location is %s', (_label, location) => {
    const banner = getApplicationHealthBanner({
      healthCheckResult: buildResult({
        action: { label: 'Reconnect', location },
      }),
      fallbackLocation: FALLBACK_LOCATION,
    });

    expect(banner?.message).toBe('Your key was revoked');
    expect(banner?.action).toBeUndefined();
  });

  it('should drop the action when there is no location and no fallback', () => {
    expect(
      getApplicationHealthBanner({
        healthCheckResult: buildResult({ action: { label: 'Configure' } }),
      })?.action,
    ).toBeUndefined();
  });
});
