import { useSetRecoilState } from 'recoil';
import {
  type FrontComponentExecutionContext,
  type FrontComponentHostCommunicationApi,
} from 'twenty-sdk/front-component-renderer';
import { type AppPath, type EnqueueSnackbarParams } from 'twenty-shared/types';

import { currentUserState } from '@/auth/states/currentUserState';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { useUnmountHeadlessFrontComponent } from '@/front-components/hooks/useUnmountHeadlessFrontComponent';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { assertUnreachable } from 'twenty-shared/utils';
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
  const currentUser = useRecoilValueV2(currentUserState);
  const navigateApp = useNavigateApp();
  const { navigateCommandMenu } = useNavigateCommandMenu();
  const setCommandMenuSearchState = useSetRecoilState(commandMenuSearchState);
  const { getIcon } = useIcons();
  const unmountHeadlessFrontComponent = useUnmountHeadlessFrontComponent();
  const {
    enqueueSuccessSnackBar,
    enqueueErrorSnackBar,
    enqueueInfoSnackBar,
    enqueueWarningSnackBar,
  } = useSnackBar();
  const { closeCommandMenu } = useCommandMenu();

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

  const enqueueSnackbar: FrontComponentHostCommunicationApi['enqueueSnackbar'] =
    async ({
      message,
      variant,
      duration,
      detailedMessage,
      dedupeKey,
    }: EnqueueSnackbarParams) => {
      const snackBarOptions = {
        duration,
        detailedMessage,
        dedupeKey,
      };

      switch (variant) {
        case 'error':
          enqueueErrorSnackBar({ message, options: snackBarOptions });
          break;
        case 'info':
          enqueueInfoSnackBar({ message, options: snackBarOptions });
          break;
        case 'warning':
          enqueueWarningSnackBar({ message, options: snackBarOptions });
          break;
        case 'success':
          enqueueSuccessSnackBar({ message, options: snackBarOptions });
          break;
        default:
          assertUnreachable(variant);
      }
    };

  const executionContext: FrontComponentExecutionContext = {
    frontComponentId,
    userId: currentUser?.id ?? null,
  };

  const unmountFrontComponent: FrontComponentHostCommunicationApi['unmountFrontComponent'] =
    async () => {
      unmountHeadlessFrontComponent(frontComponentId);
    };

  const closeSidePanel: FrontComponentHostCommunicationApi['closeSidePanel'] =
    async () => {
      closeCommandMenu();
    };

  const frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi =
    {
      navigate,
      openSidePanelPage,
      enqueueSnackbar,
      unmountFrontComponent,
      closeSidePanel,
    };

  return {
    executionContext,
    frontComponentHostCommunicationApi,
  };
};
