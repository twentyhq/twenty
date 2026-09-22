import { isDefined } from 'twenty-shared/utils';
import { Callout } from 'twenty-ui/primitives/feedback';
import { type ApplicationHealthStatus } from '~/generated-metadata/graphql';
import { getApplicationHealthBannerAppearance } from '~/pages/settings/applications/utils/getApplicationHealthBannerAppearance';

type SettingsApplicationHealthBannerProps = {
  healthStatus: ApplicationHealthStatus;
  healthMessage: string;
  action?: { label: string; onClick: () => void };
};

export const SettingsApplicationHealthBanner = ({
  healthStatus,
  healthMessage,
  action,
}: SettingsApplicationHealthBannerProps) => {
  const appearance = getApplicationHealthBannerAppearance(healthStatus);

  if (!isDefined(appearance)) {
    return null;
  }

  return (
    <Callout
      variant={appearance.variant}
      Icon={appearance.Icon}
      title={healthMessage}
      action={action}
      fullWidth
    />
  );
};
