import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { MainButton } from '@/ui/components/buttons/MainButton';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { SubSectionTitle } from '@/ui/components/section-titles/SubSectionTitle';
import { useCheckUserExistsQuery } from '~/generated/graphql';

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

  const { login, signUp, signUpToWorkspace } = useAuth();
  const { loading, data } = useCheckUserExistsQuery({
    variables: {
      email: authFlowUserEmail,
    },
  });

  useEffect(() => {
    setMockMode(true);
  }, [setMockMode]);

  const workspaceInviteHash = useParams().workspaceInviteHash;

  const handleSubmit = useCallback(async () => {
    try {
      setMockMode(false);
      if (data?.checkUserExists.exists) {
        await login(authFlowUserEmail, internalPassword);
      } else {
        if (workspaceInviteHash) {
          await signUpToWorkspace(
            authFlowUserEmail,
            internalPassword,
            workspaceInviteHash,
          );
        } else {
          await signUp(authFlowUserEmail, internalPassword);
        }
      }
      navigate('/auth/create/workspace');
    } catch (err: any) {
      setFormError(err.message);
    }
  }, [
    login,
    signUp,
    signUpToWorkspace,
    authFlowUserEmail,
    internalPassword,
    setMockMode,
    navigate,
    data?.checkUserExists.exists,

    workspaceInviteHash,
  ]);

  useScopedHotkeys(
    'enter',
    () => {
      handleSubmit();
    },
    InternalHotkeysScope.PasswordLogin,
    [handleSubmit],
  );

  return (
    <>
      <Logo />
      <Title>Welcome to Twenty</Title>
      <SubTitle>
        Enter your credentials to sign{' '}
        {data?.checkUserExists.exists ? 'in' : 'up'}
      </SubTitle>
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
            onClick={handleSubmit}
            disabled={!authFlowUserEmail || !internalPassword || loading}
            fullWidth
          />
        </StyledButtonContainer>
        {formError && <StyledErrorContainer>{formError}</StyledErrorContainer>}
      </StyledAnimatedContent>
    </>
  );
}
