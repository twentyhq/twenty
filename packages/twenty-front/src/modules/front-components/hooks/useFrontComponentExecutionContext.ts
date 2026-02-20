import {
  type FrontComponentExecutionContext,
  type FrontComponentHostCommunicationApi,
} from 'twenty-sdk/front-component-renderer';
import { type AppPath } from 'twenty-shared/types';

import { currentUserState } from '@/auth/states/currentUserState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useFrontComponentExecutionContext = (): {
  executionContext: FrontComponentExecutionContext;
  frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi;
} => {
  const currentUser = useRecoilValueV2(currentUserState);
  const navigateApp = useNavigateApp();

  const navigate: FrontComponentHostCommunicationApi['navigate'] = async (
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

  const executionContext: FrontComponentExecutionContext = {
    userId: currentUser?.id ?? null,
  };

  const frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi =
    {
      navigate,
    };

  return {
    executionContext,
    frontComponentHostCommunicationApi,
  };
};
