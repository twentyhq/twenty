import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

import { hasAccessToken } from '../services/AuthService';

const EmptyContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
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
  opacity: 0;
  animation: ${fadeIn} 1s forwards;
`;

export function RequireAuth({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasAccessToken()) {
      navigate('/auth/login');
    }
  }, [navigate]);

  if (!hasAccessToken())
    return (
      <EmptyContainer>
        <FadeInStyle>
          Please hold on a moment, we're directing you to our login page...
        </FadeInStyle>
      </EmptyContainer>
    );
  return children;
}
