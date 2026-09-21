import { ApplicationHealthStatus } from '~/generated-metadata/graphql';
import { getApplicationHealthBannerAppearance } from '~/pages/settings/applications/utils/getApplicationHealthBannerAppearance';

describe('getApplicationHealthBannerAppearance', () => {
  it.each([
    [ApplicationHealthStatus.INFO, 'info'],
    [ApplicationHealthStatus.ERROR, 'error'],
  ])('should map %s to the %s callout variant', (healthStatus, variant) => {
    expect(getApplicationHealthBannerAppearance(healthStatus)?.variant).toBe(
      variant,
    );
  });

  it.each([ApplicationHealthStatus.OK, ApplicationHealthStatus.UNKNOWN])(
    'should return nothing for %s',
    (healthStatus) => {
      expect(
        getApplicationHealthBannerAppearance(healthStatus),
      ).toBeUndefined();
    },
  );
});
