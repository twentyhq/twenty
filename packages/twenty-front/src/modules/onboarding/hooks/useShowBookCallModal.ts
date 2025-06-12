import { useMemo } from 'react';

import { AppPath } from '@/types/AppPath';
import { useLocation } from 'react-router-dom';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const useShowBookCallModal = () => {
  const location = useLocation();

  return useMemo(() => {
    if (isMatchingLocation(location, AppPath.BookCall)) {
      return true;
    }

    return false;
  }, [location]);
};
