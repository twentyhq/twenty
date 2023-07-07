import { useCallback, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useRecoilState } from 'recoil';

import { Logo } from '@/auth/components/ui/Logo';
import { SubTitle } from '@/auth/components/ui/SubTitle';
import { Title } from '@/auth/components/ui/Title';
import { useAuth } from '@/auth/hooks/useAuth';
import { authFlowUserEmailState } from '@/auth/states/authFlowUserEmailState';
import { isMockModeState } from '@/auth/states/isMockModeState';
import { isDemoModeState } from '@/client-config/states/isDemoModeState';
import { MainButton } from '@/ui/components/buttons/MainButton';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { SubSectionTitle } from '@/ui/components/section-titles/SubSectionTitle';

const StyledContentContainer = styled.div`
  width: 100%;
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(6)};
  }
`;

const StyledAnimatedContent = styled(motion.div)`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(8)};
  }
`;

const StyledSectionContainer = styled.div`
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(4)};
  }
`;

const StyledButtonContainer = styled.div`
  width: 200px;
`;

const StyledErrorContainer = styled.div`
  color: ${({ theme }) => theme.color.red};
`;

export function PasswordLogin() {
  const navigate = useNavigate();
  const [isDemoMode] = useRecoilState(isDemoModeState);

  const [authFlowUserEmail, setAuthFlowUserEmail] = useRecoilState(
    authFlowUserEmailState,
  );
  const [, setMockMode] = useRecoilState(isMockModeState);
  const [internalPassword, setInternalPassword] = useState(
    isDemoMode ? 'Applecar2025' : '',
  );
  const [formError, setFormError] = useState('');

  const { login } = useAuth();

  const handleLogin = useCallback(async () => {
    try {
      setMockMode(false);

      await login(authFlowUserEmail, internalPassword);

      navigate('/auth/create/workspace');
    } catch (err: any) {
      setFormError(err.message);
    }
  }, [login, authFlowUserEmail, internalPassword, setMockMode, navigate]);

  useHotkeys(
    'enter',
    () => {
      handleLogin();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [handleLogin],
  );

  return (
    <>
      <Logo />
      <Title>Welcome to Twenty</Title>
      <SubTitle>Enter your credentials to sign in</SubTitle>
      <StyledAnimatedContent>
        <StyledContentContainer>
          <StyledSectionContainer>
            <SubSectionTitle title="Email" />
            <TextInput
              value={authFlowUserEmail}
              placeholder="Email"
              onChange={(value) => setAuthFlowUserEmail(value)}
              fullWidth
            />
          </StyledSectionContainer>
          <StyledSectionContainer>
            <SubSectionTitle title="Password" />
            <TextInput
              value={internalPassword}
              placeholder="Password"
              onChange={(value) => setInternalPassword(value)}
              fullWidth
              type="password"
            />
          </StyledSectionContainer>
        </StyledContentContainer>
        <StyledButtonContainer>
          <MainButton
            title="Continue"
            onClick={handleLogin}
            disabled={!authFlowUserEmail || !internalPassword}
            fullWidth
          />
        </StyledButtonContainer>
        {formError && <StyledErrorContainer>{formError}</StyledErrorContainer>}
      </StyledAnimatedContent>
    </>
  );
}
