import { SettingsConnectableAppConnectButton } from '@/settings/app-preferences/components/SettingsConnectableAppConnectButton';
import { SettingsApplicationActionButton } from '@/settings/applications/components/SettingsApplicationActionButton';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type SettingsAvailableApplicationActionButtonProps = {
  name: string;
  connectUrl?: string | null;
  installedApplicationId?: string;
  canInstallMarketplaceApps?: boolean;
  onInstall?: () => void;
  isInstalling?: boolean;
  installProgress?: number;
};

export const SettingsAvailableApplicationActionButton = ({
  name,
  connectUrl,
  installedApplicationId,
  canInstallMarketplaceApps,
  onInstall,
  isInstalling,
  installProgress,
}: SettingsAvailableApplicationActionButtonProps) => {
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );

  if (isDefined(connectUrl)) {
    if (!isAppPreferencesEnabled) {
      return null;
    }

    return (
      <SettingsConnectableAppConnectButton
        connectableApp={{ name, connectUrl }}
      />
    );
  }

  return (
    <SettingsApplicationActionButton
      installedApplicationId={installedApplicationId}
      canInstallMarketplaceApps={canInstallMarketplaceApps}
      onInstall={onInstall}
      isInstalling={isInstalling}
      installProgress={installProgress}
    />
  );
};
