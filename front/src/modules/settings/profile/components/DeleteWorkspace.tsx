import { useState } from 'react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { useRecoilValue } from 'recoil';

import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { AppPath } from '@/types/AppPath';
import { Button, ButtonVariant } from '@/ui/button/components/Button';
import { TextInput } from '@/ui/input/components/TextInput';
import { Modal } from '@/ui/modal/components/Modal';
import { SubSectionTitle } from '@/ui/title/components/SubSectionTitle';
import { useDeleteCurrentWorkspaceMutation } from '~/generated/graphql';

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

const StyledModal = styled(Modal)`
  width: calc(400px - ${({ theme }) => theme.spacing(10 * 2)});
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(8)};
  }
`;

export function DeleteWorkspace() {
  const [isOpen, setIsOpen] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [email, setEmail] = useState('');
  const currentUser = useRecoilValue(currentUserState);
  const userEmail = currentUser?.email;

  const [deleteCurrentWorkspace] = useDeleteCurrentWorkspaceMutation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    signOut();
    navigate(AppPath.SignIn);
  }, [signOut, navigate]);

  const deleteWorkspace = async () => {
    await deleteCurrentWorkspace();
    handleLogout();
  };

  const isEmailMatchingUserEmail = debounce(
    (email1?: string, email2?: string) => {
      setIsValidEmail(Boolean(email1 && email2 && email1 === email2));
    },
    250,
  );

  const handleEmailChange = (val: string) => {
    setEmail(val);
    isEmailMatchingUserEmail(val, userEmail);
  };

  const errorMessage =
    email && !isValidEmail ? 'email provided is not correct' : '';

  return (
    <>
      <SubSectionTitle
        title="Danger zone"
        description="Delete your whole workspace"
      />
      <StyledDeleteButton
        onClick={() => setIsOpen(!isOpen)}
        variant={ButtonVariant.Secondary}
        title="Delete workspace"
      />

      <AnimatePresence mode="wait">
        <LayoutGroup>
          <StyledModal isOpen={isOpen}>
            <StyledTitle>Workspace Deletion</StyledTitle>
            <div>
              This action cannot be undone. This will permanently delete your
              entire workspace. Please type in your email to confirm.
            </div>
            <TextInput
              value={email}
              onChange={handleEmailChange}
              placeholder={userEmail}
              fullWidth
              key={'email-' + userEmail}
              error={errorMessage}
            />
            <StyledDeleteButton
              onClick={deleteWorkspace}
              variant={ButtonVariant.Secondary}
              title="Delete workspace"
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
          </StyledModal>
        </LayoutGroup>
      </AnimatePresence>
    </>
  );
}
