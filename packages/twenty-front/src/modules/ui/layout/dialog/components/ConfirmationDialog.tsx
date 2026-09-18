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
import { Section } from 'twenty-ui/components';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCenteredButton = styled(Button)`
  box-sizing: border-box;
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledDescription = styled(Dialog.Description)`
  && {
    color: inherit;
    font-size: inherit;
    line-height: inherit;
    margin-bottom: ${themeCssVariables.spacing[6]};
  }
`;

const defaultConfirmButtonText = msg`Confirm`;

export const ConfirmationDialog = ({
  dialogId,
  title,
  loading,
  subtitle,
  onConfirmClick,
  onClose,
  confirmButtonText,
  confirmationValue,
  confirmationPlaceholder,
  confirmButtonColor = 'danger',
  AdditionalButtons,
  hideCancelButton = false,
}: ConfirmationDialogProps) => {
  const { i18n, t } = useLingui();
  const translatedConfirmButtonText =
    confirmButtonText ?? i18n._(defaultConfirmButtonText);
  const [inputConfirmationValue, setInputConfirmationValue] =
    useState<string>('');

  const isValidValue =
    !isNonEmptyString(confirmationValue) ||
    inputConfirmationValue === confirmationValue;

  const { closeDialog } = useDialog();

  const handleClose = () => {
    setInputConfirmationValue('');
    closeDialog(dialogId);
  };

  const handleConfirmClick = () => {
    handleClose();
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
      onEnter={handleEnter}
      renderInDocumentBody
    >
      {({ container, backdrop, viewportProps, onKeyDown }) => (
        <Dialog.Popup
          {...{ container, backdrop, viewportProps, onKeyDown }}
          data-globally-prevent-click-outside
          style={{
            padding: 'var(--t-spacing-6)',
            borderRadius: 'var(--t-spacing-1)',
            width: 'calc(400px - var(--t-spacing-32))',
          }}
        >
          <Dialog.Title>{title}</Dialog.Title>
          <StyledDescription render={<div />}>
            <Section.Root align="center" color="primary">
              {subtitle}
            </Section.Root>
          </StyledDescription>
          {isNonEmptyString(confirmationValue) && (
            <Section.Root>
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
            </Section.Root>
          )}
          {!hideCancelButton && (
            <StyledCenteredButton
              onClick={handleCancelClick}
              fullWidth
              data-testid="confirmation-modal-cancel-button"
              variant="outline"
            >{t`Cancel`}</StyledCenteredButton>
          )}

          {AdditionalButtons}

          <StyledCenteredButton
            onClick={handleConfirmClick}
            disabled={!isValidValue || loading}
            fullWidth
            data-testid="confirmation-modal-confirm-button"
            variant={confirmButtonColor === 'neutral' ? 'outline' : 'solid'}
            color={confirmButtonColor}
          >
            {translatedConfirmButtonText}
          </StyledCenteredButton>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
