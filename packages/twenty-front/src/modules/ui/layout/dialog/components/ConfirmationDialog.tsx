import { Button } from 'twenty-ui/primitives/input';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { type ConfirmationDialogProps } from '@/ui/layout/dialog/types/ConfirmationDialogProps';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';

import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { isDefined } from 'twenty-shared/utils';

const StyledActions = styled.div`
  align-items: stretch;
  flex-direction: column;
`;

const defaultConfirmButtonText = msg`Confirm`;

export const ConfirmationDialog = ({
  dialogId,
  children,
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
  confirmButtonVariant,
  closeOnConfirm = true,
  confirmOnEnter = true,
  AdditionalButtons,
  hideCancelButton = false,
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

  const handleConfirmClick = () => {
    if (closeOnConfirm) {
      handleClose();
    }
    onConfirmClick();
  };

  const handleCancelClick = () => {
    handleClose();
    onClose?.();
  };

  const handleEnter = () => {
    if (isValidValue && !loading) {
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
      onEnter={confirmOnEnter ? handleEnter : undefined}
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
          {(isNonEmptyString(confirmationValue) || isDefined(children)) && (
            <Dialog.Body>
              {isNonEmptyString(confirmationValue) && (
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
              )}
              {children}
            </Dialog.Body>
          )}
          <Dialog.Footer render={<StyledActions />}>
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
              disabled={!isValidValue || loading}
              fullWidth
              data-testid="confirmation-modal-confirm-button"
              variant={
                confirmButtonVariant ??
                (confirmButtonColor === 'neutral' ? 'outline' : 'solid')
              }
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
