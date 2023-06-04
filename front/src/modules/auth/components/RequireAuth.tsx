import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { hasAccessToken } from '../services/AuthService';

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

  return children;
}
