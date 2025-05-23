import { useMemo } from 'react';

import { SettingsPath } from '@/types/SettingsPath';
import { useLocation } from 'react-router-dom';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const useShowFullscreen = () => {
  const location = useLocation();

  return useMemo(() => {
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
  }, [location]);
};
