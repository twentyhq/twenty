import { ReactNode, useState } from 'react';
import styled from '@emotion/styled';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { Button, ButtonVariant } from '@/ui/button/components/Button';
import { TextInput } from '@/ui/input/text/components/TextInput';
import { Modal } from '@/ui/modal/components/Modal';
import { Section, SectionAlignment } from '@/ui/section/components/Section';
import { H1Title, H1TitleFontColor } from '@/ui/typography/components/H1Title';
import { debounce } from '~/utils/debounce';

interface DeleteModalProps {
  isOpen: boolean;
  title: string;
  subtitle: ReactNode;
  setIsOpen: (val: boolean) => void;
  handleConfirmDelete: () => void;
  deleteButtonText?: string;
}

const StyledCenteredButton = styled(Button)`
  justify-content: center;
`;

export const StyledDeleteButton = styled(StyledCenteredButton)`
  border-color: ${({ theme }) => theme.color.red20};
  box-shadow: none;
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.md};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  :hover {
    background-color: ${({ theme }) => theme.color.red10};
  }
`;

export function DeleteModal({
  isOpen = false,
  title,
  subtitle,
  setIsOpen,
  handleConfirmDelete,
  deleteButtonText = 'Delete',
}: DeleteModalProps) {
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);
  const currentUser = useRecoilValue(currentUserState);
  const userEmail = currentUser?.email;

  const handleEmailChange = (val: string) => {
    setEmail(val);
    isEmailMatchingUserEmail(val, userEmail);
  };

  const isEmailMatchingUserEmail = debounce(
    (email1?: string, email2?: string) => {
      setIsValidEmail(Boolean(email1 && email2 && email1 === email2));
    },
    250,
  );

  return (
    <AnimatePresence mode="wait">
      <LayoutGroup>
        <Modal
          isOpen={isOpen}
          onOutsideClick={() => {
            if (isOpen) {
              setIsOpen(false);
            }
          }}
        >
          <H1Title title={title} fontColor={H1TitleFontColor.Primary} />
          <Section alignment={SectionAlignment.Center}>{subtitle}</Section>
          <Section>
            <TextInput
              value={email}
              onChange={handleEmailChange}
              placeholder={userEmail}
              fullWidth
              key={'email-' + userEmail}
            />
          </Section>
          <StyledDeleteButton
            onClick={handleConfirmDelete}
            variant={ButtonVariant.Secondary}
            title={deleteButtonText}
            disabled={!isValidEmail || !email}
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
        </Modal>
      </LayoutGroup>
    </AnimatePresence>
  );
}
