import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconDownload, IconSettings } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

type SettingsApplicationActionButtonProps = {
  installedApplicationId?: string;
  canInstallMarketplaceApps?: boolean;
  onInstall?: () => void;
  isInstalling?: boolean;
};

export const SettingsApplicationActionButton = ({
  installedApplicationId,
  canInstallMarketplaceApps,
  onInstall,
  isInstalling,
}: SettingsApplicationActionButtonProps) => {
  if (isDefined(installedApplicationId) && isInstalling !== true) {
    return (
      <Button
        Icon={IconSettings}
        title={t`Open settings`}
        variant="primary"
        accent="blue"
        size="small"
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
    <Button
      Icon={IconDownload}
      title={isInstalling ? t`Installing...` : t`Install`}
      variant="primary"
      accent="blue"
      size="small"
      onClick={onInstall}
      disabled={isInstalling}
    />
  );
};
