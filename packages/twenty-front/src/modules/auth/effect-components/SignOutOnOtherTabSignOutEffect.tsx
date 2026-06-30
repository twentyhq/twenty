import { useAuth } from '@/auth/hooks/useAuth';
import { subscribeToSignOutFromOtherTabs } from '@/auth/utils/crossTabSignOut';
import { useEffect } from 'react';

export const SignOutOnOtherTabSignOutEffect = () => {
  const { clearSession } = useAuth();

  useEffect(() => {
    const unsubscribe = subscribeToSignOutFromOtherTabs(() => {
      clearSession();
    });

    return unsubscribe;
  }, [clearSession]);

  return null;
};
