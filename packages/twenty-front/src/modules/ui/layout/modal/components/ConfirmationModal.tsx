import styled from '@emotion/styled';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { H1Title, H1TitleFontColor } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';

import { Button, ButtonAccent } from '@/ui/input/button/components/Button';
import { TextInput } from '@/ui/input/components/TextInput';

import { Modal } from '@/ui/layout/modal/components/Modal';
import {
  Section,
  SectionAlignment,
  SectionFontColor,
} from '@/ui/layout/section/components/Section';

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
  deleteButtonText = 'Delete',
  confirmationValue,
  confirmationPlaceholder,
  confirmButtonAccent = 'danger',
  AdditionalButtons,
}: ConfirmationModalProps) => {
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
                  key={'input-' + confirmationValue}
                />
              </Section>
            )}
            <StyledCenteredButton
              onClick={() => setIsOpen(false)}
              variant="secondary"
              title="Cancel"
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
