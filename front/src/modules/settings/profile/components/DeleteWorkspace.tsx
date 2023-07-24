import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import debounce from 'lodash.debounce';
import { useRecoilValue } from 'recoil';

import { StyledContainer } from '@/auth/components/Modal';
import { currentUserState } from '@/auth/states/currentUserState';
import { Button } from '@/ui/button/components/Button';
import { TextInput } from '@/ui/input/components/TextInput';
import { Modal } from '@/ui/modal/components/Modal';
import { SubSectionTitle } from '@/ui/title/components/SubSectionTitle';

const CenteredButton = styled(Button)`
  align-items: center;
  display: flex;
  justify-content: center;
`;

const StyledDeleteButton = styled(CenteredButton)`
  border-color: ${({ theme }) => theme.color['red20-1']};
  border-width: '1px';
  color: ${({ theme }) => theme.color.red};
  font-size: '13px';
  font-weight: 500;
  line-height: '150%';
`;

const StyledModalContainer = styled(StyledContainer)`
  color: ${({ theme }) => theme.font.color.primary};
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(8)};
  }
`;

const EmailField: FC<{
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  userEmail?: string;
  isDeleteDisabled: boolean;
}> = ({ value, setValue, userEmail, isDeleteDisabled }) => {
  const errorMessage =
    value && isDeleteDisabled ? 'email provided is not correct' : '';

  return (
    <TextInput
      value={value}
      placeholder={userEmail}
      fullWidth
      key={'email-' + userEmail}
      onChange={setValue}
      error={errorMessage}
    />
  );
};

export const DeleteWorkspace = () => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDisabled, setIsDeleteDisabled] = useState(true);
  const [value, setValue] = useState('');
  const currentUser = useRecoilValue(currentUserState);
  const userEmail = currentUser?.email;

  const deleteWorkspace = async () => {
    console.log('Deleting workspace');
    setValue('');
    setIsOpen(false);
  };

  const validate = debounce(() => {
    setIsDeleteDisabled(!userEmail || !value || value !== userEmail);
  }, 250);

  useEffect(() => {
    validate();
  }, [validate, value]);

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
        disabled={false}
      />

      <Modal isOpen={isOpen}>
        <StyledModalContainer>
          <div
            style={{
              fontSize: theme.font.size.lg,
              fontWeight: theme.font.weight.semiBold,
            }}
          >
            Workspace Deletion
          </div>
          <div>
            This action cannot be undone. This will permanently delete your
            entire workspace. Please type in your email to confirm.
          </div>
          <EmailField {...{ value, setValue, userEmail, isDeleteDisabled }} />
          <StyledDeleteButton
            onClick={deleteWorkspace}
            variant="secondary"
            title="Delete workspace"
            disabled={isDeleteDisabled}
            fullWidth
          />
          <CenteredButton
            onClick={() => setIsOpen(false)}
            variant="secondary"
            title="Cancel"
            disabled={false}
            fullWidth
            style={{
              marginTop: 10,
            }}
          />
        </StyledModalContainer>
      </Modal>
    </>
  );
};
