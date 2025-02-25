import { useMemo } from 'react';

import { SettingsPath } from '@/types/SettingsPath';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

export const useShowFullscreen = () => {
  const { isMatchingLocation } = useIsMatchingLocation();

  return useMemo(() => {
    if (isMatchingLocation('settings/' + SettingsPath.PlaygroundRouter)) {
      return true;
    }

    return false;
  }, [isMatchingLocation]);
};
