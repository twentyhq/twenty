import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconDownload, IconTrash, IconUpload } from 'twenty-ui/icon';
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
  const { openModal } = useModal();
  const uninstallModalId = useId();

  const confirmationValue = t`yes`;

  if (!canInstallMarketplaceApps) {
    return null;
  }

  if (!isInstalled || isInstalling) {
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
  }

  if (hasUpdate) {
    return (
      <Button
        startIcon={<IconUpload />}
        variant="outline"
        color="accent"
        size="sm"
        onClick={onUpgrade}
        disabled={isUpgrading}
      >
        {isUpgrading
          ? t`Upgrading...`
          : t`Upgrade to ${latestAvailableVersion ?? ''}`}
      </Button>
    );
  }

  if (canBeUninstalled && isDefined(onUninstall)) {
    return (
      <>
        <Button
          startIcon={<IconTrash />}
          variant="outline"
          color="danger"
          size="sm"
          onClick={() => openModal(uninstallModalId)}
          disabled={isUninstalling}
        >
          {isUninstalling ? t`Uninstalling...` : t`Uninstall`}
        </Button>
        <ConfirmationModal
          confirmationPlaceholder={confirmationValue}
          confirmationValue={confirmationValue}
          modalInstanceId={uninstallModalId}
          title={t`Uninstall Application?`}
          subtitle={
            <Trans>
              Please type {`"${confirmationValue}"`} to confirm you want to
              uninstall this application.
            </Trans>
          }
          onConfirmClick={onUninstall}
          confirmButtonText={t`Uninstall`}
          loading={isUninstalling}
        />
      </>
    );
  }

  return (
    <Button
      startIcon={<IconCheck />}
      variant="outline"
      size="sm"
      disabled
    >{t`Installed`}</Button>
  );
};
