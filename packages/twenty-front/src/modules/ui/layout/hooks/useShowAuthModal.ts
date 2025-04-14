import { useMemo } from 'react';

import { AppPath } from '@/types/AppPath';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

export const useShowAuthModal = () => {
  const { isMatchingLocation } = useIsMatchingLocation();

  return useMemo(() => {
    if (
      isMatchingLocation(AppPath.Invite) ||
      isMatchingLocation(AppPath.InviteTeam) ||
      isMatchingLocation(AppPath.CreateProfile) ||
      isMatchingLocation(AppPath.SyncEmails) ||
      isMatchingLocation(AppPath.ResetPassword) ||
      isMatchingLocation(AppPath.VerifyEmail) ||
      isMatchingLocation(AppPath.Verify) ||
      isMatchingLocation(AppPath.SignInUp) ||
      isMatchingLocation(AppPath.CreateWorkspace) ||
      isMatchingLocation(AppPath.PlanRequired) ||
      isMatchingLocation(AppPath.PlanRequiredSuccess)
    ) {
      return true;
    }

    return false;
  }, [isMatchingLocation]);
};
