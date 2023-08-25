import { ReactNode, useState } from 'react';
import styled from '@emotion/styled';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import debounce from 'lodash.debounce';

import { Button, ButtonVariant } from '@/ui/button/components/Button';
import { TextInput } from '@/ui/input/text/components/TextInput';
import { Modal } from '@/ui/modal/components/Modal';
import {
  Section,
  SectionAlignment,
  SectionFontColor,
} from '@/ui/section/components/Section';
import { H1Title, H1TitleFontColor } from '@/ui/typography/components/H1Title';

export type ConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  subtitle: ReactNode;
  setIsOpen: (val: boolean) => void;
  onConfirmClick: () => void;
  deleteButtonText?: string;
  confirmationPlaceholder?: string;
  confirmationValue?: string;
};

const StyledConfirmationModal = styled(Modal)`
  border-radius: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(6)};
  width: calc(400px - ${({ theme }) => theme.spacing(32)});
`;

const StyledCenteredButton = styled(Button)`
  justify-content: center;
`;

const StyledCenteredTitle = styled.div`
  text-align: center;
`;

export const StyledConfirmationButton = styled(StyledCenteredButton)`
  border-color: ${({ theme }) => theme.color.red20};
  box-shadow: none;
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.md};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  :hover {
    background-color: ${({ theme }) => theme.color.red10};
  }
`;

export function ConfirmationModal({
  isOpen = false,
  title,
  subtitle,
  setIsOpen,
  onConfirmClick,
  deleteButtonText = 'Delete',
  confirmationValue,
  confirmationPlaceholder,
}: ConfirmationModalProps) {
  const [inputConfirmationValue, setInputConfirmationValue] =
    useState<string>('');
  const [isValidValue, setIsValidValue] = useState(!confirmationValue);

  const handleInputConfimrationValueChange = (value: string) => {
    setInputConfirmationValue(value);
    isValueMatchingInput(confirmationValue, value);
  };

  const isValueMatchingInput = debounce(
    (value?: string, inputValue?: string) => {
      setIsValidValue(Boolean(value && inputValue && value === inputValue));
    },
    250,
  );

  return (
    <AnimatePresence mode="wait">
      <LayoutGroup>
        <StyledConfirmationModal
          isOpen={isOpen}
          onClose={() => {
            if (isOpen) {
              setIsOpen(false);
            }
          }}
          onEnter={onConfirmClick}
        >
          <StyledCenteredTitle>
            <H1Title title={title} fontColor={H1TitleFontColor.Primary} />
          </StyledCenteredTitle>
          <Section
            alignment={SectionAlignment.Center}
            fontColor={SectionFontColor.Primary}
          >
            {subtitle}
          </Section>
          {confirmationValue && (
            <Section>
              <TextInput
                value={inputConfirmationValue}
                onChange={handleInputConfimrationValueChange}
                placeholder={confirmationPlaceholder}
                fullWidth
                key={'input-' + confirmationValue}
              />
            </Section>
          )}
          <StyledConfirmationButton
            onClick={onConfirmClick}
            variant={ButtonVariant.Secondary}
            title={deleteButtonText}
            disabled={!isValidValue}
            fullWidth
          />
          <StyledCenteredButton
            onClick={() => setIsOpen(false)}
            variant={ButtonVariant.Secondary}
            title="Cancel"
            fullWidth
            style={{
              marginTop: 10,
            }}
          />
        </StyledConfirmationModal>
      </LayoutGroup>
    </AnimatePresence>
  );
}
