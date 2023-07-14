import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useRecoilState } from 'recoil';

import { FooterNote } from '@/auth/components/ui/FooterNote';
import { HorizontalSeparator } from '@/auth/components/ui/HorizontalSeparator';
import { Logo } from '@/auth/components/ui/Logo';
import { Title } from '@/auth/components/ui/Title';
import { authFlowUserEmailState } from '@/auth/states/authFlowUserEmailState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { isDemoModeState } from '@/client-config/states/isDemoModeState';
import { useScopedHotkeys } from '@/lib/hotkeys/hooks/useScopedHotkeys';
import { MainButton } from '@/ui/components/buttons/MainButton';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { AnimatedEaseIn } from '@/ui/components/motion/AnimatedEaseIn';
import { IconBrandGoogle } from '@/ui/icons';
import { PageHotkeyScope } from '~/sync-hooks/types/PageHotkeyScope';

const StyledContentContainer = styled.div`
  width: 200px;
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(3)};
  }
`;

const StyledFooterNote = styled(FooterNote)`
  max-width: 283px;
`;

export function Index() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [authProviders] = useRecoilState(authProvidersState);
  const [demoMode] = useRecoilState(isDemoModeState);

  const [authFlowUserEmail, setAuthFlowUserEmail] = useRecoilState(
    authFlowUserEmailState,
  );

  const [visible, setVisible] = useState(false);

  const onGoogleLoginClick = useCallback(() => {
    window.location.href = process.env.REACT_APP_AUTH_URL + '/google' || '';
  }, []);

  const onPasswordLoginClick = useCallback(() => {
    if (!visible) {
      setVisible(true);
      return;
    }

    navigate('/auth/password-login');
  }, [navigate, visible]);

  useScopedHotkeys(
    'enter',
    () => {
      onPasswordLoginClick();
    },
    PageHotkeyScope.AuthIndex,
    [onPasswordLoginClick],
  );

  useEffect(() => {
    setAuthFlowUserEmail(demoMode ? 'tim@apple.dev' : '');
  }, [navigate, setAuthFlowUserEmail, demoMode]);

  return (
    <>
      <AnimatedEaseIn>
        <Logo />
      </AnimatedEaseIn>
      <Title animate>Welcome to Twenty</Title>
      <StyledContentContainer>
        {authProviders.google && (
          <MainButton
            icon={<IconBrandGoogle size={theme.icon.size.sm} stroke={4} />}
            title="Continue with Google"
            onClick={onGoogleLoginClick}
            fullWidth
          />
        )}
        {visible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{
              type: 'spring',
              stiffness: 800,
              damping: 35,
            }}
          >
            <HorizontalSeparator />
            <TextInput
              value={authFlowUserEmail}
              placeholder="Email"
              onChange={(value) => setAuthFlowUserEmail(value)}
              fullWidth={true}
            />
          </motion.div>
        )}
        <MainButton
          title="Continue with Email"
          onClick={onPasswordLoginClick}
          disabled={!authFlowUserEmail && visible}
          variant="secondary"
          fullWidth
        />
      </StyledContentContainer>
      <StyledFooterNote>
        By using Twenty, you agree to the Terms of Service and Data Processing
        Agreement.
      </StyledFooterNote>
    </>
  );
}
