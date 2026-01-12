import { useRecoilState } from 'recoil';

import { lastAuthenticatedMethodState } from '@/auth/states/lastAuthenticatedMethodState';
import { type AuthenticatedMethod } from '@/auth/types/AuthenticatedMethod.enum';

export const useLastAuthenticatedMethod = () => {
  const [lastAuthenticatedMethod, setLastAuthenticatedMethod] = useRecoilState(
    lastAuthenticatedMethodState,
  );

  return {
    lastAuthenticatedMethod,
    setLastAuthenticatedMethod: (method: AuthenticatedMethod) =>
      setLastAuthenticatedMethod(method),
  };
};
