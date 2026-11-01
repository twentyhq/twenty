import { ApplicationHealthStatus } from '~/generated-metadata/graphql';
import { getApplicationHealthBannerAppearance } from '~/pages/settings/applications/utils/getApplicationHealthBannerAppearance';

describe('getApplicationHealthBannerAppearance', () => {
  it.each([
    { healthStatus: ApplicationHealthStatus.SUCCESS, status: 'success' },
    { healthStatus: ApplicationHealthStatus.INFO, status: 'info' },
    { healthStatus: ApplicationHealthStatus.WARNING, status: 'warning' },
    { healthStatus: ApplicationHealthStatus.ERROR, status: 'error' },
    { healthStatus: ApplicationHealthStatus.NEUTRAL, status: 'neutral' },
  ])(
    'should map $healthStatus to the $status callout status',
    ({ healthStatus, status }) => {
      expect(getApplicationHealthBannerAppearance(healthStatus)?.status).toBe(
        status,
      );
    },
  );

  it.each([ApplicationHealthStatus.OK, ApplicationHealthStatus.UNKNOWN])(
    'should return nothing for %s',
    (healthStatus) => {
      expect(
        getApplicationHealthBannerAppearance(healthStatus),
      ).toBeUndefined();
    },
  );
});
