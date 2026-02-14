import { useCallback, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import {
  type FrontComponentExecutionContext,
  type FrontComponentHostCommunicationApi,
} from 'twenty-sdk/front-component-renderer';
import { type AppPath } from 'twenty-shared/types';

import { currentUserState } from '@/auth/states/currentUserState';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useFrontComponentExecutionContext = (): {
  executionContext: FrontComponentExecutionContext;
  frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi;
} => {
  const currentUser = useRecoilValue(currentUserState);
  const navigateApp = useNavigateApp();

  const navigate = useCallback<FrontComponentHostCommunicationApi['navigate']>(
    async (to, params, queryParams, options) => {
      navigateApp(
        to as AppPath,
        params as Parameters<typeof navigateApp>[1],
        queryParams,
        options,
      );
    },
    [navigateApp],
  );

  const executionContext = useMemo<FrontComponentExecutionContext>(
    () => ({
      userId: currentUser?.id ?? null,
    }),
    [currentUser?.id],
  );

  const requestAccessTokenRefresh = useCallback(async (): Promise<string> => {
    throw new Error(
      'requestAccessTokenRefresh must be provided by FrontComponentRenderer',
    );
  }, []);

  const frontComponentHostCommunicationApi =
    useMemo<FrontComponentHostCommunicationApi>(
      () => ({
        navigate,
        requestAccessTokenRefresh,
      }),
      [navigate, requestAccessTokenRefresh],
    );

  return {
    executionContext,
    frontComponentHostCommunicationApi,
  };
};
