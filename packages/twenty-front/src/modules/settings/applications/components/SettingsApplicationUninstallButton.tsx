import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useId } from 'react';
import { IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

type SettingsApplicationUninstallButtonProps = {
  onUninstall: () => void;
  isUninstalling?: boolean;
};

export const SettingsApplicationUninstallButton = ({
  onUninstall,
  isUninstalling,
}: SettingsApplicationUninstallButtonProps) => {
  const { openModal } = useModal();
  const uninstallModalId = useId();

  const confirmationValue = t`yes`;

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
};
