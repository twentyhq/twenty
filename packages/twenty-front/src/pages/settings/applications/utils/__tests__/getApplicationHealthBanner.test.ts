import { ApplicationHealthStatus } from '~/generated-metadata/graphql';
import { getApplicationHealthBanner } from '~/pages/settings/applications/utils/getApplicationHealthBanner';

const AVAILABLE_TAB_IDS = ['general', 'variables'];

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
      getApplicationHealthBanner({
        healthCheckResult: null,
        availableTabIds: AVAILABLE_TAB_IDS,
      }),
    ).toBeUndefined();
  });

  it('should return nothing when the result carries no message', () => {
    expect(
      getApplicationHealthBanner({
        healthCheckResult: buildResult({ message: null }),
        availableTabIds: AVAILABLE_TAB_IDS,
      }),
    ).toBeUndefined();
  });

  it('should send the action to the location reported by the app', () => {
    expect(
      getApplicationHealthBanner({
        healthCheckResult: buildResult({
          action: { label: 'Reconnect', location: 'variables' },
        }),
        availableTabIds: AVAILABLE_TAB_IDS,
      })?.action,
    ).toEqual({ label: 'Reconnect', tabId: 'variables' });
  });

  it('should fall back to the configuration tab when the app reports no location', () => {
    expect(
      getApplicationHealthBanner({
        healthCheckResult: buildResult({ action: { label: 'Configure' } }),
        availableTabIds: AVAILABLE_TAB_IDS,
        fallbackTabId: 'variables',
      })?.action,
    ).toEqual({ label: 'Configure', tabId: 'variables' });
  });

  it('should drop the action when the reported location is not rendered', () => {
    const banner = getApplicationHealthBanner({
      healthCheckResult: buildResult({
        action: { label: 'Reconnect', location: 'settings' },
      }),
      availableTabIds: AVAILABLE_TAB_IDS,
    });

    expect(banner?.message).toBe('Your key was revoked');
    expect(banner?.action).toBeUndefined();
  });

  it('should drop the action when there is no location and no fallback tab', () => {
    expect(
      getApplicationHealthBanner({
        healthCheckResult: buildResult({ action: { label: 'Configure' } }),
        availableTabIds: AVAILABLE_TAB_IDS,
      })?.action,
    ).toBeUndefined();
  });
});
