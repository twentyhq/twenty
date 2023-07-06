import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { captureHotkeyTypeInFocusState } from '@/hotkeys/states/captureHotkeyTypeInFocusState';

import { useIsLogged } from '../hooks/useIsLogged';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import { currentUserState } from '../states/currentUserState';
import { isMockModeState } from '../states/isMockModeState';
import { OnboardingStatus } from '../utils/getOnboardingStatus';

const EmptyContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const FadeInStyle = styled.div`
  animation: ${fadeIn} 1s forwards;
  opacity: 0;
`;

export function RequireOnboarding({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  const navigate = useNavigate();

  const [, setCaptureHotkeyTypeInFocus] = useRecoilState(
    captureHotkeyTypeInFocusState,
  );
  const [currentUser] = useRecoilState(currentUserState);
  const onboardingStatus = useOnboardingStatus();
  const isLogged = useIsLogged();

  useEffect(() => {
    if (!isLogged) {
      navigate('/auth');
    } else if (!currentUser?.workspaceMember) {
      navigate('/auth/create/workspace');
    } else if (!currentUser?.firstName || !currentUser?.lastName) {
      navigate('/auth/create/profile');
    }
  }, [
    currentUser?.firstName,
    currentUser?.lastName,
    currentUser?.workspaceMember,
    isLogged,
    navigate,
  ]);

  useEffect(() => {
    if (isLogged && onboardingStatus === OnboardingStatus.Completed) {
      setCaptureHotkeyTypeInFocus(false);
    }
  }, [setCaptureHotkeyTypeInFocus, navigate, onboardingStatus, isLogged]);

  if (!isLogged || onboardingStatus === OnboardingStatus.Ongoing) {
    return (
      <EmptyContainer>
        <FadeInStyle>
          Please hold on a moment, we're directing you to our login page...
        </FadeInStyle>
      </EmptyContainer>
    );
  }

  return children;
}
