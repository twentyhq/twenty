import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/primitives/feedback';
import { type ApplicationHealthStatus } from '~/generated-metadata/graphql';
import { getApplicationHealthBannerAppearance } from '~/pages/settings/applications/utils/getApplicationHealthBannerAppearance';

type SettingsApplicationHealthBannerProps = {
  healthStatus: ApplicationHealthStatus;
  healthMessage: string;
  healthActionLabel?: string | null;
  onAction: () => void;
};

export const SettingsApplicationHealthBanner = ({
  healthStatus,
  healthMessage,
  healthActionLabel,
  onAction,
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
      button={{
        title: isDefined(healthActionLabel) ? healthActionLabel : t`Configure`,
        onClick: onAction,
      }}
    />
  );
};
