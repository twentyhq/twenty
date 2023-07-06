import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

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

export function RequireOnboarding({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  const navigate = useNavigate();

  const onboardingStatus = useOnboardingStatus();

  useEffect(() => {
    if (onboardingStatus === OnboardingStatus.Completed) {
      navigate('/');
    }
  }, [navigate, onboardingStatus]);

  if (onboardingStatus === OnboardingStatus.Completed) {
    return (
      <EmptyContainer>
        <FadeInStyle>
          Please hold on a moment, we're directing you to the app...
        </FadeInStyle>
      </EmptyContainer>
    );
  }

  return children;
}
