import { formatQueueJobProgressLabel } from '@/queue-job/utils/formatQueueJobProgressLabel';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

type SettingsApplicationUninstallButtonProps = {
  onUninstall: () => void;
  isUninstalling?: boolean;
  uninstallProgress?: number;
  disabledReason?: string;
};

export const SettingsApplicationUninstallButton = ({
  onUninstall,
  isUninstalling,
  uninstallProgress,
  disabledReason,
}: SettingsApplicationUninstallButtonProps) => {
  const { openDialog } = useDialog();
  const uninstallDialogId = useId();

  const confirmationValue = t`yes`;
  const displayedUninstallProgress = formatQueueJobProgressLabel(
    uninstallProgress ?? 0,
  );

  const isDisabled = isNonEmptyString(disabledReason);

  return (
    <>
      <Tooltip
        content={disabledReason}
        side="bottom"
        positionMethod="fixed"
        delay={TooltipDelay.shortDelay}
        disabled={!isDisabled}
      >
        <span tabIndex={isDisabled ? 0 : undefined}>
          <Button
            startIcon={<IconTrash />}
            variant="outline"
            color="danger"
            size="sm"
            onClick={() => openDialog(uninstallDialogId)}
            disabled={isDisabled}
            loading={isUninstalling}
            loadingPosition="end"
          >
            {isUninstalling
              ? t`Uninstalling ${displayedUninstallProgress}`
              : t`Uninstall`}
          </Button>
        </span>
      </Tooltip>
      <ConfirmationDialog
        confirmationPlaceholder={confirmationValue}
        confirmationValue={confirmationValue}
        dialogId={uninstallDialogId}
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
