import { useAuth } from '@/auth/hooks/useAuth';
import { subscribeToSignOut } from '@/auth/utils/crossTabSignOut';
import { useEffect } from 'react';

export const SignOutOnOtherTabSignOutEffect = () => {
  const { clearSession } = useAuth();

  useEffect(() => {
    const unsubscribe = subscribeToSignOut(() => {
      clearSession();
    });

    return unsubscribe;
  }, [clearSession]);

  return null;
};
