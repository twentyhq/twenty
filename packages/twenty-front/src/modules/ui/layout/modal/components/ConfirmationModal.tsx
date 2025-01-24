import styled from '@emotion/styled';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { ReactNode, useState } from 'react';
import {
  Button,
  ButtonAccent,
  H1Title,
  H1TitleFontColor,
  Section,
  SectionAlignment,
  SectionFontColor,
} from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';

import { TextInput } from '@/ui/input/components/TextInput';

import { Modal, ModalVariants } from '@/ui/layout/modal/components/Modal';
import { useLingui } from '@lingui/react/macro';

export type ConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  loading?: boolean;
  subtitle: ReactNode;
  setIsOpen: (val: boolean) => void;
  onConfirmClick: () => void;
  deleteButtonText?: string;
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
  isOpen = false,
  title,
  loading,
  subtitle,
  setIsOpen,
  onConfirmClick,
  deleteButtonText = `Delete`,
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

  const handleConfirmClick = () => {
    onConfirmClick();

    setIsOpen(false);
  };

  const handleEnter = () => {
    if (isValidValue) {
      handleConfirmClick();
    }
  };

  return (
    <AnimatePresence mode="wait">
      <LayoutGroup>
        {isOpen && (
          <StyledConfirmationModal
            onClose={() => {
              if (isOpen) {
                setIsOpen(false);
              }
            }}
            onEnter={handleEnter}
            isClosable={true}
            padding="large"
            modalVariant={modalVariant}
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
                <TextInput
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
              onClick={() => {
                setIsOpen(false);
              }}
              variant="secondary"
              title={t`Cancel`}
              fullWidth
            />

            {AdditionalButtons}

            <StyledCenteredButton
              onClick={handleConfirmClick}
              variant="secondary"
              accent={confirmButtonAccent}
              title={deleteButtonText}
              disabled={!isValidValue || loading}
              fullWidth
              dataTestId="confirmation-modal-confirm-button"
            />
          </StyledConfirmationModal>
        )}
      </LayoutGroup>
    </AnimatePresence>
  );
};
