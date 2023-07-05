import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { useIsLogged } from '../hooks/useIsLogged';
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

export function RequireNotOnboard({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  const navigate = useNavigate();

  const [currentUser] = useRecoilState(currentUserState);
  const isLogged = useIsLogged();

  useEffect(() => {
    if (
      isLogged &&
      currentUser?.firstName &&
      currentUser?.lastName &&
      currentUser.workspaceMember
    ) {
      navigate('/');
    }
  }, [
    currentUser?.firstName,
    currentUser?.lastName,
    currentUser?.workspaceMember,
    isLogged,
    navigate,
  ]);

  if (
    isLogged &&
    currentUser?.firstName &&
    currentUser?.lastName &&
    currentUser?.workspaceMember
  ) {
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
