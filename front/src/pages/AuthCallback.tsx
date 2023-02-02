import React, { useEffect } from 'react';
import { useGetAccessToken } from '../hooks/AuthenticationHooks';

function AuthCallback() {
  const { token } = useGetAccessToken();

  useEffect(() => {
    if (token) {
      window.location.href = '/';
    }
  }, [token]);

  return <div></div>;
}

export default AuthCallback;
