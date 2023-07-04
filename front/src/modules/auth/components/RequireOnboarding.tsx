import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { currentUserState } from '../states/currentUserState';

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

  const [currentUser] = useRecoilState(currentUserState);

  useEffect(() => {
    if (
      !currentUser?.firstName ||
      !currentUser?.lastName ||
      !currentUser?.workspaceMember
    ) {
      navigate('/auth/create/workspace');
    }
  }, [currentUser, navigate]);

  if (
    !currentUser?.firstName ||
    !currentUser?.lastName ||
    !currentUser?.workspaceMember
  ) {
    return (
      <EmptyContainer>
        <FadeInStyle>
          Please hold on a moment, we're directing you to our onboarding page...
        </FadeInStyle>
      </EmptyContainer>
    );
  }

  return children;
}
