import { useCallback, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { InputLabel } from '@/auth/components/ui/InputLabel';
import { Logo } from '@/auth/components/ui/Logo';
import { Modal } from '@/auth/components/ui/Modal';
import { SubTitle } from '@/auth/components/ui/SubTitle';
import { Title } from '@/auth/components/ui/Title';
import { getTokensFromLoginToken } from '@/auth/services/AuthService';
import { authFlowUserEmailState } from '@/auth/states/authFlowUserEmailState';
import { isMockModeState } from '@/auth/states/isMockModeState';
import { PrimaryButton } from '@/ui/components/buttons/PrimaryButton';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { Companies } from '~/pages/companies/Companies';

const StyledContentContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(4)};
  padding-top: ${({ theme }) => theme.spacing(6)};
  width: 320px;
`;

const StyledInputContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(7)};
`;

const StyledErrorContainer = styled.div`
  color: ${({ theme }) => theme.red};
`;

export function PasswordLogin() {
  const navigate = useNavigate();
  const [, setMockMode] = useRecoilState(isMockModeState);

  const prefillPassword =
    process.env.NODE_ENV === 'development' ? 'applecar2025' : '';

  const [authFlowUserEmail, setAuthFlowUserEmail] = useRecoilState(
    authFlowUserEmailState,
  );
  const [internalPassword, setInternalPassword] = useState(prefillPassword);
  const [formError, setFormError] = useState('');

  const userLogin = useCallback(async () => {
    const response = await fetch(
      process.env.REACT_APP_AUTH_URL + '/password' || '',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: authFlowUserEmail,
          password: internalPassword,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      setFormError(errorData.message);
      return;
    }
    const { loginToken } = await response.json();

    if (!loginToken) {
      return;
    }

    await getTokensFromLoginToken(loginToken.token);
    setMockMode(false);

    navigate('/');
  }, [authFlowUserEmail, internalPassword, navigate, setMockMode]);

  useHotkeys(
    'enter',
    () => {
      userLogin();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [userLogin],
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
              value={internalPassword}
              placeholder="Password"
              onChange={(value) => setInternalPassword(value)}
              fullWidth
              type="password"
            />
            <StyledButtonContainer>
              <PrimaryButton fullWidth onClick={userLogin}>
                Continue
              </PrimaryButton>
            </StyledButtonContainer>
          </StyledInputContainer>
          {formError && (
            <StyledErrorContainer>{formError}</StyledErrorContainer>
          )}
        </StyledContentContainer>
      </Modal>
    </>
  );
}
