import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { Button } from '@/ui/button/components/Button';
import { TextInput } from '@/ui/input/components/TextInput';
import { Modal } from '@/ui/modal/components/Modal';
import { SubSectionTitle } from '@/ui/title/components/SubSectionTitle';

import { debounce } from '../../../../utils/debounce';

const StyledCenteredButton = styled(Button)`
  justify-content: center;
`;

const StyledDeleteButton = styled(StyledCenteredButton)`
  border-color: ${({ theme }) => theme.color.red20};
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.md};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
`;

const StyledTitle = styled.div`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

function EmailField({
  email,
  setEmail,
  userEmail,
  isDeleteDisabled,
}: {
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  userEmail?: string;
  isDeleteDisabled: boolean;
}) {
  const errorMessage =
    email && isDeleteDisabled ? 'email provided is not correct' : '';

  return (
    <TextInput
      value={email}
      placeholder={userEmail}
      fullWidth
      key={'email-' + userEmail}
      onChange={setEmail}
      error={errorMessage}
    />
  );
}

export function DeleteWorkspace() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDisabled, setIsDeleteDisabled] = useState(true);
  const [email, setEmail] = useState('');
  const currentUser = useRecoilValue(currentUserState);
  const userEmail = currentUser?.email;

  const deleteWorkspace = async () => {
    setEmail('');
    setIsOpen(false);
  };

  const validate = debounce(() => {
    setIsDeleteDisabled(!userEmail || !email || email !== userEmail);
  }, 250);

  useEffect(() => {
    validate();
  }, [validate, email]);

  return (
    <>
      <SubSectionTitle
        title="Danger zone"
        description="Delete your whole workspace"
      />
      <StyledDeleteButton
        onClick={() => setIsOpen(!isOpen)}
        variant="secondary"
        title="Delete workspace"
      />

      <AnimatePresence mode="wait">
        <LayoutGroup>
          <Modal isOpen={isOpen}>
            <StyledTitle>Workspace Deletion</StyledTitle>
            <div>
              This action cannot be undone. This will permanently delete your
              entire workspace. Please type in your email to confirm.
            </div>
            <EmailField {...{ email, setEmail, userEmail, isDeleteDisabled }} />
            <StyledDeleteButton
              onClick={deleteWorkspace}
              variant="secondary"
              title="Delete workspace"
              disabled={isDeleteDisabled}
              fullWidth
            />
            <StyledCenteredButton
              onClick={() => setIsOpen(false)}
              variant="secondary"
              title="Cancel"
              fullWidth
              style={{
                marginTop: 10,
              }}
            />
          </Modal>
        </LayoutGroup>
      </AnimatePresence>
    </>
  );
}
