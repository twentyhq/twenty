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
import { H1Title, H1TitleFontColor } from 'twenty-ui/primitives/typography';
import {
  Section,
  SectionAlignment,
  SectionFontColor,
} from 'twenty-ui/primitives/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCenteredTitle = styled.div`
  text-align: center;
`;

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
      <StyledCenteredTitle>
        <H1Title title={title} fontColor={H1TitleFontColor.Primary} />
      </StyledCenteredTitle>
      <StyledSectionContainer>
        <Section
          alignment={SectionAlignment.Center}
          fontColor={SectionFontColor.Primary}
        >
          {subtitle}
        </Section>
      </StyledSectionContainer>
      {confirmationValue && (
        <Section>
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
        </Section>
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
