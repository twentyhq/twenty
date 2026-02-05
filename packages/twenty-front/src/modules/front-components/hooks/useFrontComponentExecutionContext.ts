import { useRecoilValue } from 'recoil';
import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';
import { type AppPath } from 'twenty-shared/types';

import { currentUserState } from '@/auth/states/currentUserState';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useFrontComponentExecutionContext = (): {
  frontComponentExecutionContext: FrontComponentExecutionContext;
} => {
  const currentUser = useRecoilValue(currentUserState);
  const navigateApp = useNavigateApp();

  const navigate: FrontComponentExecutionContext['navigate'] = async (
    to,
    params,
    queryParams,
    options,
  ) => {
    navigateApp(
      to as AppPath,
      params as Parameters<typeof navigateApp>[1],
      queryParams,
      options,
    );
  };

  const frontComponentExecutionContext = {
    userId: currentUser?.id ?? null,
    navigate,
  };

  return {
    frontComponentExecutionContext,
  };
};
