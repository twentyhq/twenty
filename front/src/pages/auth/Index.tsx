import { useCallback, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { FooterNote } from '@/auth/components/ui/FooterNote';
import { HorizontalSeparator } from '@/auth/components/ui/HorizontalSeparator';
import { Logo } from '@/auth/components/ui/Logo';
import { Modal } from '@/auth/components/ui/Modal';
import { Title } from '@/auth/components/ui/Title';
import { authFlowUserEmailState } from '@/auth/states/authFlowUserEmailState';
import { isMockModeState } from '@/auth/states/isMockModeState';
import { captureHotkeyTypeInFocusState } from '@/hotkeys/states/captureHotkeyTypeInFocusState';
import { PrimaryButton } from '@/ui/components/buttons/PrimaryButton';
import { SecondaryButton } from '@/ui/components/buttons/SecondaryButton';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { IconBrandGoogle } from '@/ui/icons';
import { Companies } from '~/pages/companies/Companies';

const StyledContentContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(8)};
  padding-top: ${({ theme }) => theme.spacing(8)};
  width: 200px;
`;

export function Index() {
  const [, setCaptureHotkeyTypeInFocus] = useRecoilState(
    captureHotkeyTypeInFocusState,
  );
  const navigate = useNavigate();
  const theme = useTheme();
  const [, setMockMode] = useRecoilState(isMockModeState);

  const [authFlowUserEmail, setAuthFlowUserEmail] = useRecoilState(
    authFlowUserEmailState,
  );

  const onGoogleLoginClick = useCallback(() => {
    window.location.href = process.env.REACT_APP_AUTH_URL + '/google' || '';
  }, []);

  const onPasswordLoginClick = useCallback(() => {
    navigate('/auth/password-login');
  }, [navigate]);

  useHotkeys(
    'enter',
    () => {
      onPasswordLoginClick();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [onPasswordLoginClick],
  );

  useEffect(() => {
    setMockMode(true);
    setCaptureHotkeyTypeInFocus(true);
  }, [navigate, setMockMode, setCaptureHotkeyTypeInFocus]);

  return (
    <>
      <Companies />
      <Modal>
        <Logo />
        <Title>Welcome to Twenty</Title>
        <StyledContentContainer>
          <PrimaryButton fullWidth={true} onClick={onGoogleLoginClick}>
            <IconBrandGoogle size={theme.icon.size.sm} stroke={4} />
            Continue With Google
          </PrimaryButton>
          <HorizontalSeparator />
          <TextInput
            value={authFlowUserEmail}
            placeholder="Email"
            onChange={(value) => setAuthFlowUserEmail(value)}
            fullWidth={true}
          />
          <SecondaryButton fullWidth={true} onClick={onPasswordLoginClick}>
            Continue
          </SecondaryButton>
        </StyledContentContainer>
        <FooterNote>
          By using Twenty, you agree to the Terms of Service and Data Processing
          Agreement.
        </FooterNote>
      </Modal>
    </>
  );
}
