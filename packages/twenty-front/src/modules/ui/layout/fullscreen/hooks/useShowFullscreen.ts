import { useMemo } from 'react';

import { isOnboardingV2EnabledState } from '@/client-config/states/isOnboardingV2EnabledState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLocation } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const useShowFullscreen = () => {
  const location = useLocation();
  const isOnboardingV2Enabled = useAtomStateValue(isOnboardingV2EnabledState);

  return useMemo(() => {
    if (
      isOnboardingV2Enabled &&
      (isMatchingLocation(location, AppPath.CreateWorkspace) ||
        isMatchingLocation(location, AppPath.CreateProfile) ||
        isMatchingLocation(location, AppPath.SyncEmails))
    ) {
      return true;
    }

    if (
      isMatchingLocation(
        location,
        'settings/' + SettingsPath.RestPlayground + '/*',
      ) ||
      isMatchingLocation(location, 'settings/' + SettingsPath.GraphQLPlayground)
    ) {
      return true;
    }

    return false;
  }, [location, isOnboardingV2Enabled]);
};
