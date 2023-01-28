import React, { useEffect } from 'react';
import AuthService from '../hooks/AuthenticationHooks';

function AuthCallback() {
  const { useGetAccessToken } = AuthService;

  const { token } = useGetAccessToken();

  useEffect(() => {
    if (token) {
      window.location.href = '/';
    }
  }, [token]);

  return <div></div>;
}

export default AuthCallback;
