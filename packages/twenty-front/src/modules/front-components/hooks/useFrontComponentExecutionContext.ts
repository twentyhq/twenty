import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  type FrontComponentExecutionContext,
  type FrontComponentHostCommunicationApi,
} from 'twenty-sdk/front-component-renderer';
import { type AppPath } from 'twenty-shared/types';

import { currentUserState } from '@/auth/states/currentUserState';
import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { useUnmountHeadlessFrontComponent } from '@/front-components/hooks/useUnmountHeadlessFrontComponent';
import { useIcons } from 'twenty-ui/display';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useFrontComponentExecutionContext = ({
  frontComponentId,
}: {
  frontComponentId: string;
}): {
  executionContext: FrontComponentExecutionContext;
  frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi;
} => {
  const currentUser = useRecoilValue(currentUserState);
  const navigateApp = useNavigateApp();
  const { navigateCommandMenu } = useNavigateCommandMenu();
  const setCommandMenuSearchState = useSetRecoilState(commandMenuSearchState);
  const { getIcon } = useIcons();
  const unmountHeadlessFrontComponent = useUnmountHeadlessFrontComponent();

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

  const openSidePanelPage: FrontComponentHostCommunicationApi['openSidePanelPage'] =
    async ({ page, pageTitle, pageIcon, shouldResetSearchState }) => {
      navigateCommandMenu({
        page,
        pageTitle,
        pageIcon: getIcon(pageIcon),
      });

      if (shouldResetSearchState === true) {
        setCommandMenuSearchState('');
      }
    };

  const executionContext: FrontComponentExecutionContext = {
    userId: currentUser?.id ?? null,
  };

  const unmountFrontComponent: FrontComponentHostCommunicationApi['unmountFrontComponent'] =
    async () => {
      unmountHeadlessFrontComponent(frontComponentId);
    };

  const frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi =
    {
      navigate,
      openConfirmationModal,
      openSidePanelPage,
      unmountFrontComponent,
    };

  return {
    executionContext,
    frontComponentHostCommunicationApi,
  };
};
