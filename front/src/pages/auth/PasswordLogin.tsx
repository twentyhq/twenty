import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { InputLabel } from '@/auth/components/ui/InputLabel';
import { Logo } from '@/auth/components/ui/Logo';
import { Modal } from '@/auth/components/ui/Modal';
import { SubTitle } from '@/auth/components/ui/SubTitle';
import { Title } from '@/auth/components/ui/Title';
import { authFlowUserEmailState } from '@/auth/states/authFlowUserEmailState';
import { PrimaryButton } from '@/ui/components/buttons/PrimaryButton';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { Companies } from '~/pages/companies/Companies';

const StyledContentContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(8)};
  padding-top: ${({ theme }) => theme.spacing(6)};
  width: 320px;
`;

const StyledInputContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(7)};
`;

export function PasswordLogin() {
  const [authFlowUserEmail, setAuthFlowUserEmail] = useRecoilState(
    authFlowUserEmailState,
  );

  return (
    <>
      <Companies />
      <Modal>
        <Logo />
        <Title>Welcome to Twenty</Title>
        <SubTitle>Enter your credentials to sign in</SubTitle>
        <StyledContentContainer>
          <StyledInputContainer>
            <InputLabel label="Email" />
            <TextInput
              value={authFlowUserEmail}
              placeholder="Email"
              onChange={(value) => setAuthFlowUserEmail(value)}
              fullWidth
            />
          </StyledInputContainer>
          <StyledInputContainer>
            <InputLabel label="Password" />
            <TextInput
              value=""
              placeholder="Password"
              fullWidth
              type="password"
            />
            <StyledButtonContainer>
              <PrimaryButton fullWidth>Continue</PrimaryButton>
            </StyledButtonContainer>
          </StyledInputContainer>
        </StyledContentContainer>
      </Modal>
    </>
  );
}
