import { AUTH_MODAL_CONFIG } from '@/auth/constants/AuthModalConfig';
import { AppPath } from '@/types/AppPath';
import { Location } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const getAuthModalConfig = (location: Location) => {
  for (const path of Object.values(AppPath)) {
    if (
      isMatchingLocation(location, path) &&
      isDefined(AUTH_MODAL_CONFIG[path])
    ) {
      return AUTH_MODAL_CONFIG[path];
    }
  }

  return AUTH_MODAL_CONFIG.default;
};
