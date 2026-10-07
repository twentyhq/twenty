import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { Callout } from 'twenty-ui/components/feedback';
import { themeCssVariables } from 'twenty-ui/theme';
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
      status={appearance.status}
      icon={
        <appearance.Icon
          size={themeCssVariables.icon.size.md}
          aria-hidden={true}
        />
      }
      title={title}
      description={description}
      action={
        isDefined(action) ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            style={{ fontWeight: 'var(--t-font-weight-regular)' }}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ) : undefined
      }
      fullWidth
    />
  );
};
