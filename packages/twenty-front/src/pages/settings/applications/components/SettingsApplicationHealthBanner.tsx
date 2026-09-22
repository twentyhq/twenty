import { isDefined } from 'twenty-shared/utils';
import { Callout } from 'twenty-ui/primitives/feedback';
import { type ApplicationHealthStatus } from '~/generated-metadata/graphql';
import { getApplicationHealthBannerAppearance } from '~/pages/settings/applications/utils/getApplicationHealthBannerAppearance';

type SettingsApplicationHealthBannerProps = {
  healthStatus: ApplicationHealthStatus;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
};

export const SettingsApplicationHealthBanner = ({
  healthStatus,
  title,
  description,
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
      title={title}
      description={description}
      action={action}
      fullWidth
    />
  );
};
