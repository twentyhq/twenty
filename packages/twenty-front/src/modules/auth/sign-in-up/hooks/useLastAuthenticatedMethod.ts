import { useRecoilValue } from 'recoil';

import {
  LAST_AUTHENTICATED_METHOD_STORAGE_KEY,
  lastAuthenticatedMethodState,
  type LastAuthenticatedMethod,
} from '@/auth/states/lastAuthenticatedMethodState';

export const useLastAuthenticatedMethod = () => {
  const lastAuthenticatedMethod = useRecoilValue(lastAuthenticatedMethodState);
  const setLastAuthenticatedMethod = (method: LastAuthenticatedMethod) => {
    localStorage.setItem(
      LAST_AUTHENTICATED_METHOD_STORAGE_KEY,
      JSON.stringify(method),
    );
  };

  return {
    lastAuthenticatedMethod,
    setLastAuthenticatedMethod,
  };
};
