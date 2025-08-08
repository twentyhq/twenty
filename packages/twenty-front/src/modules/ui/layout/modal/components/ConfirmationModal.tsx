import styled from '@emotion/styled';
import { ReactNode, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';

import { Modal, ModalVariants } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useLingui } from '@lingui/react/macro';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { Button, ButtonAccent } from 'twenty-ui/input';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';

export type ConfirmationModalProps = {
  modalId: string;
  title: string;
  loading?: boolean;
  subtitle: ReactNode;
  onClose?: () => void;
  onConfirmClick: () => void;
  confirmButtonText?: string;
  confirmationPlaceholder?: string;
  confirmationValue?: string;
  confirmButtonAccent?: ButtonAccent;
  AdditionalButtons?: React.ReactNode;
  modalVariant?: ModalVariants;
};

const StyledConfirmationModal = styled(Modal)`
  border-radius: ${({ theme }) => theme.spacing(1)};
  width: calc(400px - ${({ theme }) => theme.spacing(32)});
  height: auto;
`;

export const StyledCenteredButton = styled(Button)`
  box-sizing: border-box;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledCenteredTitle = styled.div`
  text-align: center;
`;

const StyledSection = styled(Section)`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

export const StyledConfirmationButton = styled(StyledCenteredButton)`
  border-color: ${({ theme }) => theme.border.color.danger};
  box-shadow: none;
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.md};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  :hover {
    background-color: ${({ theme }) => theme.color.red10};
  }
`;

export const ConfirmationModal = ({
  modalId,
  title,
  loading,
  subtitle,
  onConfirmClick,
  onClose,
  confirmButtonText = 'Confirm',
  confirmationValue,
  confirmationPlaceholder,
  confirmButtonAccent = 'danger',
  AdditionalButtons,
  modalVariant = 'primary',
}: ConfirmationModalProps) => {
  const { t } = useLingui();
  const [inputConfirmationValue, setInputConfirmationValue] =
    useState<string>('');
  const [isValidValue, setIsValidValue] = useState(!confirmationValue);

  const handleInputConfimrationValueChange = (value: string) => {
    setInputConfirmationValue(value);
    isValueMatchingInput(confirmationValue, value);
  };

  const isValueMatchingInput = useDebouncedCallback(
    (value?: string, inputValue?: string) => {
      setIsValidValue(Boolean(value && inputValue && value === inputValue));
    },
    250,
  );

  const { closeModal } = useModal();

  const handleConfirmClick = () => {
    closeModal(modalId);
    onConfirmClick();
  };

  const handleCancelClick = () => {
    closeModal(modalId);
    onClose?.();
  };

  const handleEnter = () => {
    if (isValidValue) {
      handleConfirmClick();
    }
  };

  return (
    <StyledConfirmationModal
      modalId={modalId}
      onClose={() => {
        onClose?.();
      }}
      onEnter={handleEnter}
      isClosable={true}
      padding="large"
      modalVariant={modalVariant}
      dataGloballyPreventClickOutside
    >
      <StyledCenteredTitle>
        <H1Title title={title} fontColor={H1TitleFontColor.Primary} />
      </StyledCenteredTitle>
      <StyledSection
        alignment={SectionAlignment.Center}
        fontColor={SectionFontColor.Primary}
      >
        {subtitle}
      </StyledSection>
      {confirmationValue && (
        <Section>
          <SettingsTextInput
            instanceId="confirmation-modal-input"
            dataTestId="confirmation-modal-input"
            value={inputConfirmationValue}
            onChange={handleInputConfimrationValueChange}
            placeholder={confirmationPlaceholder}
            fullWidth
            disableHotkeys
            key={'input-' + confirmationValue}
          />
        </Section>
      )}
      <StyledCenteredButton
        onClick={handleCancelClick}
        variant="secondary"
        title={t`Cancel`}
        fullWidth
        dataTestId="confirmation-modal-cancel-button"
      />

      {AdditionalButtons}

      <StyledCenteredButton
        onClick={handleConfirmClick}
        variant="secondary"
        accent={confirmButtonAccent}
        title={confirmButtonText}
        disabled={!isValidValue || loading}
        fullWidth
        dataTestId="confirmation-modal-confirm-button"
      />
    </StyledConfirmationModal>
  );
};
