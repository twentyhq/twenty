import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconDownload, IconTrash, IconUpload } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

const UNINSTALL_APPLICATION_MODAL_ID = 'uninstall-application-modal';

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

  const confirmationValue = t`yes`;

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
      <>
        <Button
          Icon={IconTrash}
          title={isUninstalling ? t`Uninstalling...` : t`Uninstall`}
          variant="secondary"
          accent="danger"
          size="small"
          onClick={() => openModal(UNINSTALL_APPLICATION_MODAL_ID)}
          disabled={isUninstalling}
        />
        <ConfirmationModal
          confirmationPlaceholder={confirmationValue}
          confirmationValue={confirmationValue}
          modalInstanceId={UNINSTALL_APPLICATION_MODAL_ID}
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
      Icon={IconCheck}
      title={t`Installed`}
      variant="secondary"
      accent="default"
      size="small"
      disabled
    />
  );
};
