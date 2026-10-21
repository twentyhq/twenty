import { Button } from 'twenty-ui/primitives/input';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { type ConfirmationDialogProps } from '@/ui/layout/dialog/types/ConfirmationDialogProps';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';

import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { Dialog } from 'twenty-ui/primitives/surfaces';

const defaultConfirmButtonText = msg`Confirm`;

export const ConfirmationDialog = ({
  dialogId,
  title,
  loading,
  isConfirmButtonDisabled = false,
  subtitle,
  onConfirmClick,
  onClose,
  confirmButtonText,
  confirmationValue,
  confirmationPlaceholder,
  confirmButtonColor = 'danger',
  AdditionalButtons,
  hideCancelButton = false,
  shouldWaitForConfirmBeforeClosing = false,
}: ConfirmationDialogProps) => {
  const { i18n, t } = useLingui();
  const translatedConfirmButtonText =
    confirmButtonText ?? i18n._(defaultConfirmButtonText);
  const [inputConfirmationValue, setInputConfirmationValue] =
    useState<string>('');

  const isValidValue =
    !isConfirmButtonDisabled &&
    (!isNonEmptyString(confirmationValue) ||
      inputConfirmationValue === confirmationValue);

  const { closeDialog } = useDialog();

  const handleClose = () => {
    setInputConfirmationValue('');
    closeDialog(dialogId);
  };

  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmClick = async () => {
    if (!shouldWaitForConfirmBeforeClosing) {
      handleClose();
      onConfirmClick();

      return;
    }

    setIsConfirming(true);

    try {
      await onConfirmClick();
    } finally {
      setIsConfirming(false);
      handleClose();
    }
  };

  const isLoading = (loading ?? false) || isConfirming;

  const handleCancelClick = () => {
    handleClose();
    onClose?.();
  };

  const handleEnter = () => {
    if (isValidValue && !isLoading) {
      handleConfirmClick();
    }
  };

  return (
    <DialogInstance
      dialogId={dialogId}
      dismissible={true}
      onClose={() => {
        setInputConfirmationValue('');
        onClose?.();
      }}
      onEnter={handleEnter}
      renderInDocumentBody
    >
      {({ onKeyDown }) => (
        <Dialog.Popup
          onKeyDown={onKeyDown}
          data-globally-prevent-click-outside
          size="sm"
        >
          <Dialog.Header>
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Description render={<div />}>{subtitle}</Dialog.Description>
          </Dialog.Header>
          {isNonEmptyString(confirmationValue) && (
            <Dialog.Body>
              <SettingsTextInput
                instanceId="confirmation-modal-input"
                dataTestId="confirmation-modal-input"
                value={inputConfirmationValue}
                onChange={setInputConfirmationValue}
                placeholder={confirmationPlaceholder}
                fullWidth
                disableHotkeys
                key={'input-' + confirmationValue}
              />
            </Dialog.Body>
          )}
          <Dialog.Footer>
            {!hideCancelButton && (
              <Button
                onClick={handleCancelClick}
                fullWidth
                data-testid="confirmation-modal-cancel-button"
                variant="outline"
              >{t`Cancel`}</Button>
            )}

            {AdditionalButtons}

            <Button
              onClick={handleConfirmClick}
              disabled={!isValidValue || isLoading}
              loading={shouldWaitForConfirmBeforeClosing && isConfirming}
              fullWidth
              data-testid="confirmation-modal-confirm-button"
              variant={confirmButtonColor === 'neutral' ? 'outline' : 'solid'}
              color={confirmButtonColor}
            >
              {translatedConfirmButtonText}
            </Button>
          </Dialog.Footer>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
