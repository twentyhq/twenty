import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';
import jwt from 'jwt-decode';
import { TokenPayload } from '../interfaces/TokenPayload.interface';

const useIsNotLoggedIn = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const hasAccessToken = localStorage.getItem('accessToken');
  return (!isAuthenticated || !hasAccessToken) && !isLoading;
};

const redirectIfNotLoggedIn = () => {
  const isNotLoggedIn = useIsNotLoggedIn();
  const { loginWithRedirect } = useAuth0();
  if (isNotLoggedIn) {
    loginWithRedirect();
  }
};

const useGetUserEmailFromToken = (): string | undefined => {
  const token = localStorage.getItem('accessToken');

  const payload: TokenPayload | undefined = token ? jwt(token) : undefined;
  if (!payload) {
    return;
  }

  return payload['https://hasura.io/jwt/claims']['x-hasura-user-email'];
};

const useGetAccessToken = () => {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchToken = async () => {
      setLoading(true);
      const accessToken = await getAccessTokenSilently();
      localStorage.setItem('accessToken', accessToken);

      setLoading(false);
      setToken(accessToken);
    };

    fetchToken();
  }, []);

  return { loading, token };
};

export {
  useIsNotLoggedIn,
  useGetAccessToken,
  redirectIfNotLoggedIn,
  useGetUserEmailFromToken,
};
