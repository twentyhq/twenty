import { currentUserState } from '@/auth/states/currentUserState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCanAccessAdminPanel = () => {
  const currentUser = useAtomStateValue(currentUserState);

  return (
    (currentUser?.canAccessFullAdminPanel || currentUser?.canImpersonate) ??
    false
  );
};
