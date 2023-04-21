import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { hasAccessToken } from '../../services/AuthService';

function RequireAuth({ children }: { children: JSX.Element }): JSX.Element {
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasAccessToken()) {
      navigate('/auth/login');
    }
  }, [navigate]);

  return children;
}

export default RequireAuth;
