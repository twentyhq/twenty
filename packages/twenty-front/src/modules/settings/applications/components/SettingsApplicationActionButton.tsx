import { SettingsApplicationUninstallButton } from '@/settings/applications/components/SettingsApplicationUninstallButton';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconDownload, IconUpload } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

type SettingsApplicationActionButtonProps = {
  isInstalled: boolean;
  canInstallMarketplaceApps?: boolean;
  onInstall?: () => void;
  isInstalling?: boolean;
  hasUpdate?: boolean;
  latestAvailableVersion?: string;
  onUpgrade?: () => void;
  isUpgrading?: boolean;
  canBeUninstalled?: boolean;
  onUninstall?: () => void;
  isUninstalling?: boolean;
};

export const SettingsApplicationActionButton = ({
  isInstalled,
  canInstallMarketplaceApps,
  onInstall,
  isInstalling,
  hasUpdate,
  latestAvailableVersion,
  onUpgrade,
  isUpgrading,
  canBeUninstalled,
  onUninstall,
  isUninstalling,
}: SettingsApplicationActionButtonProps) => {
  if (!canInstallMarketplaceApps) {
    return null;
  }

  if (!isInstalled || isInstalling) {
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
  }

  if (hasUpdate) {
    return (
      <Button
        Icon={IconUpload}
        title={
          isUpgrading
            ? t`Upgrading...`
            : t`Upgrade to ${latestAvailableVersion ?? ''}`
        }
        variant="secondary"
        accent="blue"
        size="small"
        onClick={onUpgrade}
        disabled={isUpgrading}
      />
    );
  }

  if (canBeUninstalled && isDefined(onUninstall)) {
    return (
      <SettingsApplicationUninstallButton
        onUninstall={onUninstall}
        isUninstalling={isUninstalling}
      />
    );
  }

  return (
    <Button
      Icon={IconCheck}
      title={t`Installed`}
      variant="secondary"
      accent="default"
      size="small"
      disabled
    />
  );
};
