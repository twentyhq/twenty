import { StyledCenteredButton } from '@/ui/layout/modal/components/StyledCenteredButton';
import { type ConfirmationModalProps } from '@/ui/layout/modal/types/ConfirmationModalProps';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';

import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSectionContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[6]};
`;

const defaultConfirmButtonText = msg`Confirm`;

export const ConfirmationModal = ({
  modalInstanceId,
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
  overlay = 'dark',
}: ConfirmationModalProps) => {
  const { i18n, t } = useLingui();
  const translatedConfirmButtonText =
    confirmButtonText ?? i18n._(defaultConfirmButtonText);
  const [inputConfirmationValue, setInputConfirmationValue] =
    useState<string>('');

  const isValidValue =
    !isNonEmptyString(confirmationValue) ||
    inputConfirmationValue === confirmationValue;

  const { closeModal } = useModal();

  const handleClose = () => {
    setInputConfirmationValue('');
    closeModal(modalInstanceId);
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
    if (isValidValue) {
      handleConfirmClick();
    }
  };

  return (
    <ModalStatefulWrapper
      modalInstanceId={modalInstanceId}
      onClose={() => {
        setInputConfirmationValue('');
        onClose?.();
      }}
      onEnter={handleEnter}
      isClosable={true}
      padding="large"
      overlay={overlay}
      dataGloballyPreventClickOutside
      renderInDocumentBody
      smallBorderRadius
      narrowWidth
      autoHeight
    >
      <Dialog.Title>{title}</Dialog.Title>
      <StyledSectionContainer>
        <Section.Root align="center" color="primary">
          {subtitle}
        </Section.Root>
      </StyledSectionContainer>
      {confirmationValue && (
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
    </ModalStatefulWrapper>
  );
};
