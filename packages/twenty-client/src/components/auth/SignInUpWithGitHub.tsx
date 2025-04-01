import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const SignInUpWithGitHub = () => {
  const { loginWithGitHub } = useAuth();

  return (
    <button onClick={loginWithGitHub} className="oauth-button github">
      <img src="/icons/github.svg" alt="GitHub" />
      Sign in with GitHub
    </button>
  );
};
