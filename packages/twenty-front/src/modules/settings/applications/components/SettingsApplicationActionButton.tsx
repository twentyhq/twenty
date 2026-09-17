import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
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
  if (isDefined(installedApplicationId) && !isInstalling) {
    return (
      <Button
        startIcon={<IconSettings />}
        variant="solid"
        color="accent"
        size="sm"
        render={
          <Link
            to={getSettingsPath(SettingsPath.ApplicationDetail, {
              applicationId: installedApplicationId,
            })}
          />
        }
      >{t`Open settings`}</Button>
    );
  }

  if (!canInstallMarketplaceApps) {
    return null;
  }

  return (
    <Button
      startIcon={<IconDownload />}
      variant="solid"
      color="accent"
      size="sm"
      onClick={onInstall}
      disabled={isInstalling}
    >
      {isInstalling ? t`Installing...` : t`Install`}
    </Button>
  );
};
