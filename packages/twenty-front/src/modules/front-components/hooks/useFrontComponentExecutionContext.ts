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

  // TODO: replace with Twenty's ConfirmationModal once wired to the modal system
  const openConfirmationModal: FrontComponentHostCommunicationApi['openConfirmationModal'] =
    async (params) => {
      return window.confirm(`${params.title}\n\n${params.subtitle}`);
    };

  // TODO: wire to navigateCommandMenu once page/icon types are resolved
  const openSidePanelPage: FrontComponentHostCommunicationApi['openSidePanelPage'] =
    async (params) => {
      console.warn(
        '[FrontComponent] openSidePanelPage not yet fully implemented',
        params,
      );
    };

  const executionContext: FrontComponentExecutionContext = {
    userId: currentUser?.id ?? null,
  };

  const frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi =
    {
      navigate,
      openConfirmationModal,
      openSidePanelPage,
    };

  return {
    executionContext,
    frontComponentHostCommunicationApi,
  };
};
