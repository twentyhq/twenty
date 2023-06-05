import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { hasAccessToken } from '../services/AuthService';

const EmptyContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
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
        Please hold on a moment, we're directing you to our login page...
      </EmptyContainer>
    );
  return children;
}
