import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  type FrontComponentExecutionContext,
  type FrontComponentHostCommunicationApi,
} from 'twenty-sdk/front-component-renderer';
import { type AppPath, type EnqueueSnackbarParams } from 'twenty-shared/types';

import { useCommandMenuConfirmationModal } from '@/command-menu-item/confirmation-modal/hooks/useCommandMenuConfirmationModal';
import { currentUserState } from '@/auth/states/currentUserState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useRequestApplicationTokenRefresh } from '@/front-components/hooks/useRequestApplicationTokenRefresh';
import { useUnmountHeadlessFrontComponent } from '@/front-components/hooks/useUnmountHeadlessFrontComponent';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
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
  const currentUser = useAtomStateValue(currentUserState);
  const navigateApp = useNavigateApp();
  const { requestAccessTokenRefresh } = useRequestApplicationTokenRefresh({
    frontComponentId,
  });
  const { openConfirmationModal } = useCommandMenuConfirmationModal();
  const { navigateSidePanel } = useNavigateSidePanel();
  const setSidePanelSearch = useSetAtomState(sidePanelSearchState);
  const { getIcon } = useIcons();
  const unmountHeadlessFrontComponent = useUnmountHeadlessFrontComponent();
  const {
    enqueueSuccessSnackBar,
    enqueueErrorSnackBar,
    enqueueInfoSnackBar,
    enqueueWarningSnackBar,
  } = useSnackBar();
  const { closeSidePanelMenu } = useSidePanelMenu();

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
      navigateSidePanel({
        page,
        pageTitle,
        pageIcon: getIcon(pageIcon),
      });

      if (shouldResetSearchState === true) {
        setSidePanelSearch('');
      }
    };

  const openCommandConfirmationModal: FrontComponentHostCommunicationApi['openCommandConfirmationModal'] =
    async ({ title, subtitle, confirmButtonText, confirmButtonAccent }) => {
      openConfirmationModal({
        frontComponentId,
        title,
        subtitle,
        confirmButtonText,
        confirmButtonAccent,
      });
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
      closeSidePanelMenu();
    };

  const frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi =
    {
      navigate,
      requestAccessTokenRefresh,
      openSidePanelPage,
      openCommandConfirmationModal,
      enqueueSnackbar,
      unmountFrontComponent,
      closeSidePanel,
    };

  return {
    executionContext,
    frontComponentHostCommunicationApi,
  };
};
