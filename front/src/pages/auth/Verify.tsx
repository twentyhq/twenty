import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { getTokensFromLoginToken } from '@/auth/services/AuthService';

export function Verify() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const loginToken = searchParams.get('loginToken');
  const navigate = useNavigate();

  useEffect(() => {
    async function getTokens() {
      if (!loginToken) {
        return;
      }
      setIsLoading(true);
      await getTokensFromLoginToken(loginToken);
      setIsLoading(false);
      navigate('/');
    }

    if (!isLoading) {
      getTokens();
    }
  }, [isLoading, navigate, loginToken]);

  return <></>;
}
