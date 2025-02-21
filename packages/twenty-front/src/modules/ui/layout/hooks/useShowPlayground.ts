import { useMemo } from 'react';

import { SettingsPath } from '@/types/SettingsPath';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

export const useShowPlayground = () => {
  const { isMatchingLocation } = useIsMatchingLocation();

  return useMemo(() => {
    if (isMatchingLocation('settings/' + SettingsPath.PlaygroundGraphQLCore) || 
        isMatchingLocation('settings/' + SettingsPath.PlaygroundGraphQLMeta) ||
        isMatchingLocation('settings/' + SettingsPath.PlaygroundRestCore) ||
        isMatchingLocation('settings/' + SettingsPath.PlaygroundRestMeta)
    ) {
      return true;
    }

    return false
  }, [
    isMatchingLocation,
  ]);
};
