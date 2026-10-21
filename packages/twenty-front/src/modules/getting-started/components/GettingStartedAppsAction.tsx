import { GettingStartedAppInstallButton } from '@/getting-started/components/GettingStartedAppInstallButton';
import { GETTING_STARTED_APP_CONTENT } from '@/getting-started/constants/GettingStartedAppContent';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { useLingui } from '@lingui/react/macro';
import { GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';

export const GettingStartedAppsAction = () => {
  const { t } = useLingui();

  return (
    <SettingsListCard
      items={GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS.map(
        (universalIdentifier) => ({ id: universalIdentifier }),
      )}
      getItemLabel={({ id }) => t(GETTING_STARTED_APP_CONTENT[id].label)}
      getItemDescription={({ id }) =>
        t(GETTING_STARTED_APP_CONTENT[id].description)
      }
      RowIconFn={({ id }) => GETTING_STARTED_APP_CONTENT[id].Icon}
      RowRightComponent={GettingStartedAppInstallButton}
    />
  );
};
