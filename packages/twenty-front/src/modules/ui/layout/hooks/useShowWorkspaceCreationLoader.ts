import { useMemo } from 'react';

import { isOnboardingV2State } from '@/auth/states/isOnboardingV2State';
import { isWorkspaceActivationFailedState } from '@/auth/states/isWorkspaceActivationFailedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const useShowWorkspaceCreationLoader = () => {
  const location = useLocation();
  const isOnboardingV2 = useAtomStateValue(isOnboardingV2State);
  const isWorkspaceActivationFailed = useAtomStateValue(
    isWorkspaceActivationFailedState,
  );

  return useMemo(() => {
    if (isWorkspaceActivationFailed) {
      return false;
    }

    const isOnboardingV2FromUrl =
      new URLSearchParams(location.search).get('onboardingV2') === 'true';

    if (!isOnboardingV2 && !isOnboardingV2FromUrl) {
      return false;
    }

    return (
      isMatchingLocation(location, AppPath.Verify) ||
      isMatchingLocation(location, AppPath.WorkspaceActivation)
    );
  }, [isOnboardingV2, isWorkspaceActivationFailed, location]);
};
