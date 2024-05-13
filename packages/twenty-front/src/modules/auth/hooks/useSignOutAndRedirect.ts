import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { AppPath } from '@/types/AppPath';

export const useSignOutAndRedirect = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return useCallback(() => {
    signOut();
    navigate(AppPath.SignInUp);
  }, [signOut, navigate]);
};
