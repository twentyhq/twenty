import { PageCommandEffect } from '@/command-menu-item/page-command/components/PageCommandEffect';
import { PageCommandLinkEffect } from '@/command-menu-item/page-command/components/PageCommandLinkEffect';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { EngineComponentKey } from '~/generated-metadata/graphql';

type SettingsApplicationPageCommandsProps = {
  installedApplicationId?: string;
  canInstallMarketplaceApps: boolean;
  onInstall: () => void;
  isInstalling: boolean;
  installProgress?: number;
};

export const SettingsApplicationPageCommands = ({
  installedApplicationId,
  canInstallMarketplaceApps,
  onInstall,
  isInstalling,
  installProgress,
}: SettingsApplicationPageCommandsProps) => {
  if (isDefined(installedApplicationId) && !isInstalling) {
    return (
      <PageCommandLinkEffect
        engineComponentKey={EngineComponentKey.OPEN_APPLICATION_SETTINGS}
        to={getSettingsPath(SettingsPath.ApplicationDetail, {
          applicationId: installedApplicationId,
        })}
      />
    );
  }

  if (!canInstallMarketplaceApps) {
    return null;
  }

  return (
    <PageCommandEffect
      engineComponentKey={EngineComponentKey.INSTALL_APPLICATION}
      onRun={onInstall}
      isLoading={isInstalling}
      progress={installProgress}
    />
  );
};
