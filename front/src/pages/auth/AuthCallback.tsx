import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { refreshAccessToken } from '@/auth/services/AuthService';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const refreshToken = searchParams.get('refreshToken');
  localStorage.setItem('refreshToken', refreshToken || '');
  const navigate = useNavigate();

  useEffect(() => {
    async function getAccessToken() {
      await refreshAccessToken();
      setIsLoading(false);
      navigate('/');
    }

    if (isLoading) {
      getAccessToken();
    }
  }, [isLoading, navigate]);

  return <></>;
}
