import { isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/primitives/feedback';
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
    <InlineBanner
      color={appearance.color}
      LeftIcon={appearance.Icon}
      message={healthMessage}
      button={
        isDefined(action)
          ? { title: action.label, onClick: action.onClick }
          : undefined
      }
    />
  );
};
