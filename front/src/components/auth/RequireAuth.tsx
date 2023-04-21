import { useNavigate } from 'react-router-dom';
import { useHasAccessToken } from '../../hooks/auth/useHasAccessToken';
import { useEffect } from 'react';

function RequireAuth({ children }: { children: JSX.Element }): JSX.Element {
  const hasAccessToken = useHasAccessToken();

  const navigate = useNavigate();

  useEffect(() => {
    if (!hasAccessToken) {
      navigate('/auth/login');
    }
  }, [hasAccessToken, navigate]);

  return children;
}

export default RequireAuth;
