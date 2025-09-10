import { useMemo } from 'react';

import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const useShowAuthModal = () => {
  const location = useLocation();

  return useMemo(() => {
    if (
      isMatchingLocation(location, AppPath.Invite) ||
      isMatchingLocation(location, AppPath.InviteTeam) ||
      isMatchingLocation(location, AppPath.CreateProfile) ||
      isMatchingLocation(location, AppPath.SyncEmails) ||
      isMatchingLocation(location, AppPath.ResetPassword) ||
      isMatchingLocation(location, AppPath.VerifyEmail) ||
      isMatchingLocation(location, AppPath.Verify) ||
      isMatchingLocation(location, AppPath.SignInUp) ||
      isMatchingLocation(location, AppPath.CreateWorkspace) ||
      isMatchingLocation(location, AppPath.PlanRequired) ||
      isMatchingLocation(location, AppPath.PlanRequiredSuccess) ||
      isMatchingLocation(location, AppPath.BookCallDecision) ||
      isMatchingLocation(location, AppPath.BookCall)
    ) {
      return true;
    }

    return false;
  }, [location]);
};
