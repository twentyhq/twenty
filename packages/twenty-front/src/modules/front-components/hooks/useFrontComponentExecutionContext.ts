import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  type FrontComponentExecutionContext,
  type FrontComponentHostCommunicationApi,
} from 'twenty-sdk/front-component-renderer';
import {
  type AppPath,
  CommandMenuPages,
  type EnqueueSnackbarParams,
} from 'twenty-shared/types';

import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { currentUserState } from '@/auth/states/currentUserState';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { useRequestApplicationTokenRefresh } from '@/front-components/hooks/useRequestApplicationTokenRefresh';
import { useUnmountHeadlessFrontComponent } from '@/front-components/hooks/useUnmountHeadlessFrontComponent';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';
import { IconSparkles, useIcons } from 'twenty-ui/display';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useFrontComponentExecutionContext = ({
  frontComponentId,
}: {
  frontComponentId: string;
}): {
  executionContext: FrontComponentExecutionContext;
  frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi;
} => {
  const currentUser = useAtomStateValue(currentUserState);
  const navigateApp = useNavigateApp();
  const { requestAccessTokenRefresh } = useRequestApplicationTokenRefresh({
    frontComponentId,
  });
  const { navigateCommandMenu } = useNavigateCommandMenu();
  const setCommandMenuSearch = useSetAtomState(commandMenuSearchState);
  const { getIcon } = useIcons();
  const unmountHeadlessFrontComponent = useUnmountHeadlessFrontComponent();
  const {
    enqueueSuccessSnackBar,
    enqueueErrorSnackBar,
    enqueueInfoSnackBar,
    enqueueWarningSnackBar,
  } = useSnackBar();
  const { closeCommandMenu } = useCommandMenu();
  const setAgentChatInput = useSetAtomState(agentChatInputState);

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
        setCommandMenuSearch('');
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

  const { targetRecordIdentifier } = useLayoutRenderingContext();

  const executionContext: FrontComponentExecutionContext = {
    frontComponentId,
    userId: currentUser?.id ?? null,
    recordId: targetRecordIdentifier?.id ?? null,
  };

  const unmountFrontComponent: FrontComponentHostCommunicationApi['unmountFrontComponent'] =
    async () => {
      unmountHeadlessFrontComponent(frontComponentId);
    };

  const closeSidePanel: FrontComponentHostCommunicationApi['closeSidePanel'] =
    async () => {
      closeCommandMenu();
    };

  const openAskAIWithPrompt: FrontComponentHostCommunicationApi['openAskAIWithPrompt'] =
    async ({ prompt }) => {
      setAgentChatInput(prompt);

      navigateCommandMenu({
        page: CommandMenuPages.AskAI,
        pageTitle: t`Ask AI`,
        pageIcon: IconSparkles,
      });
    };

  const frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi =
    {
      navigate,
      requestAccessTokenRefresh,
      openSidePanelPage,
      enqueueSnackbar,
      unmountFrontComponent,
      closeSidePanel,
      openAskAIWithPrompt,
    };

  return {
    executionContext,
    frontComponentHostCommunicationApi,
  };
};
