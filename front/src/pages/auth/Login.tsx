import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { hasAccessToken } from '@/auth/services/AuthService';

export function Login() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!hasAccessToken()) {
      window.location.href = process.env.REACT_APP_AUTH_URL + '/google' || '';
    } else {
      navigate('/');
    }
  }, [navigate]);

  return <></>;
}
