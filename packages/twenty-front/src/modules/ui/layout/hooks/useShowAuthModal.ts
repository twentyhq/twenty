import { useMemo } from 'react';

import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const useShowAuthModal = () => {
  const location = useLocation();

  return useMemo(
    () =>
      isMatchingLocation(location, AppPath.VerifyEmail) ||
      isMatchingLocation(location, AppPath.ResetPassword) ||
      isMatchingLocation(location, AppPath.PlanRequiredSuccess) ||
      isMatchingLocation(location, AppPath.BookCallDecision) ||
      isMatchingLocation(location, AppPath.BookCall),
    [location],
  );
};
