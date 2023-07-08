import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
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

export function RequireOnboarded({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  const navigate = useNavigate();

  const onboardingStatus = useOnboardingStatus();

  useEffect(() => {
    if (onboardingStatus === OnboardingStatus.OngoingUserCreation) {
      navigate('/auth');
    } else if (onboardingStatus === OnboardingStatus.OngoingWorkspaceCreation) {
      navigate('/auth/create/workspace');
    } else if (onboardingStatus === OnboardingStatus.OngoingProfileCreation) {
      navigate('/auth/create/profile');
    }
  }, [onboardingStatus, navigate]);

  // useEffect(() => {
  //   if (onboardingStatus === OnboardingStatus.Completed) {
  //     setCaptureHotkeyTypeInFocus(false);
  //   }
  // }, [setCaptureHotkeyTypeInFocus, onboardingStatus]);

  if (onboardingStatus !== OnboardingStatus.Completed) {
    return (
      <EmptyContainer>
        <FadeInStyle>
          {onboardingStatus === OnboardingStatus.OngoingUserCreation && (
            <div>
              Please hold on a moment, we're directing you to our login page...
            </div>
          )}
          {onboardingStatus !== OnboardingStatus.OngoingUserCreation && (
            <div>
              Please hold on a moment, we're directing you to our onboarding
              flow...
            </div>
          )}
        </FadeInStyle>
      </EmptyContainer>
    );
  }

  return children;
}
