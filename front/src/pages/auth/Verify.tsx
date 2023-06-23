import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';

export function Verify() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const loginToken = searchParams.get('loginToken');
  const navigate = useNavigate();

  const { verify } = useAuth();

  useEffect(() => {
    async function getTokens() {
      if (!loginToken) {
        return;
      }
      setIsLoading(true);
      await verify(loginToken);
      setIsLoading(false);
      navigate('/');
    }

    if (!isLoading) {
      getTokens();
    }
  }, [isLoading, navigate, loginToken, verify]);

  return <></>;
}
