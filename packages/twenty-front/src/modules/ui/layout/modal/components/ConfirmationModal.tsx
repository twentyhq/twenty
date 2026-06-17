import { styled } from '@linaria/react';
import { type ReactNode, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';

import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { Button, type ButtonAccent } from 'twenty-ui/input';
import {
  Section,
  SectionAlignment,
  SectionFontColor,
  type ModalOverlay,
} from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export type ConfirmationModalProps = {
  modalInstanceId: string;
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
  overlay?: ModalOverlay;
};

const StyledCenteredButtonContainer = styled.div`
  box-sizing: border-box;
  margin-top: ${themeCssVariables.spacing[2]};
`;

export const StyledCenteredButton = (
  props: React.ComponentProps<typeof Button>,
) => (
  <StyledCenteredButtonContainer>
    {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
    <Button {...props} />
  </StyledCenteredButtonContainer>
);

const StyledCenteredTitle = styled.div`
  text-align: center;
`;

const StyledSectionContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[6]};
`;

const StyledConfirmationButtonContainer = styled.div`
  box-sizing: border-box;
  margin-top: ${themeCssVariables.spacing[2]};
  > button {
    border-color: ${themeCssVariables.border.color.danger};
    box-shadow: none;
    color: ${themeCssVariables.color.red};
    font-size: ${themeCssVariables.font.size.md};
    line-height: ${themeCssVariables.text.lineHeight.lg};
    &:hover {
      background-color: ${themeCssVariables.color.red3};
    }
  }
`;

export const StyledConfirmationButton = (
  props: React.ComponentProps<typeof Button>,
) => (
  <StyledConfirmationButtonContainer>
    {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
    <Button {...props} />
  </StyledConfirmationButtonContainer>
);

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
  confirmButtonAccent = 'danger',
  AdditionalButtons,
  overlay = 'dark',
}: ConfirmationModalProps) => {
  const { i18n, t } = useLingui();
  const translatedConfirmButtonText =
    confirmButtonText ?? i18n._(defaultConfirmButtonText);
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
    closeModal(modalInstanceId);
    onConfirmClick();
  };

  const handleCancelClick = () => {
    closeModal(modalInstanceId);
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
        justify="center"
        dataTestId="confirmation-modal-cancel-button"
      />

      {AdditionalButtons}

      <StyledCenteredButton
        onClick={handleConfirmClick}
        variant="secondary"
        accent={confirmButtonAccent}
        title={translatedConfirmButtonText}
        disabled={!isValidValue || loading}
        fullWidth
        justify="center"
        dataTestId="confirmation-modal-confirm-button"
      />
    </ModalStatefulWrapper>
  );
};
