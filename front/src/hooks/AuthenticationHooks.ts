import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';

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

export default { useIsNotLoggedIn, useGetAccessToken, redirectIfNotLoggedIn };
