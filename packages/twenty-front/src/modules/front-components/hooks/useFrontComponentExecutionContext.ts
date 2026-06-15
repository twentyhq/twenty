import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isNonEmptyString } from '@sniptt/guards';
import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';
import {
  type FrontComponentExecutionContext,
  type FrontComponentHostCommunicationApi,
} from 'twenty-front-component-renderer';
import { type AppPath, type EnqueueSnackbarParams } from 'twenty-shared/types';

import { currentUserState } from '@/auth/states/currentUserState';
import { useCommandMenuConfirmationModal } from '@/command-menu-item/confirmation-modal/hooks/useCommandMenuConfirmationModal';
import { useUnmountCommand } from '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand';
import { commandMenuItemProgressFamilyState } from '@/command-menu-item/states/commandMenuItemProgressFamilyState';
import { useRequestApplicationTokenRefresh } from '@/front-components/hooks/useRequestApplicationTokenRefresh';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const FRONT_COMPONENT_CLIPBOARD_MAX_LENGTH = 64 * 1024;
const FRONT_COMPONENT_CLIPBOARD_RATE_LIMIT_MS = 1000;
const FRONT_COMPONENT_CLIPBOARD_PREVIEW_LENGTH = 30;

export const useFrontComponentExecutionContext = ({
  frontComponentId,
  commandMenuItemId,
  selectedRecordIds,
}: {
  frontComponentId: string;
  commandMenuItemId?: string;
  selectedRecordIds?: string[];
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
  const unmountEngineCommand = useUnmountCommand();
  const {
    enqueueSuccessSnackBar,
    enqueueErrorSnackBar,
    enqueueInfoSnackBar,
    enqueueWarningSnackBar,
  } = useSnackBar();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { copyToClipboard: copyToClipboardWithSnackbar } = useCopyToClipboard();
  const { t } = useLingui();
  // oxlint-disable-next-line twenty/no-state-useref
  const lastCopyToClipboardCallAtRef = useRef<number>(Number.NEGATIVE_INFINITY);
  const setCommandMenuItemProgress = useSetAtomFamilyState(
    commandMenuItemProgressFamilyState,
    commandMenuItemId ?? '',
  );

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
        caller: { type: 'frontComponent', frontComponentId },
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

  const executionContext: FrontComponentExecutionContext = {
    frontComponentId,
    userId: currentUser?.id ?? null,
    recordId: selectedRecordIds?.length === 1 ? selectedRecordIds[0] : null,
    selectedRecordIds: selectedRecordIds ?? [],
  };

  const unmountFrontComponent: FrontComponentHostCommunicationApi['unmountFrontComponent'] =
    async () => {
      if (isDefined(commandMenuItemId)) {
        unmountEngineCommand(commandMenuItemId);
      }
    };

  const closeSidePanel: FrontComponentHostCommunicationApi['closeSidePanel'] =
    async () => {
      closeSidePanelMenu();
    };

  const updateProgress: FrontComponentHostCommunicationApi['updateProgress'] =
    async (progress) => {
      if (!isDefined(commandMenuItemId)) {
        return;
      }

      setCommandMenuItemProgress(Math.max(0, Math.min(100, progress)));
    };

  const copyToClipboard: FrontComponentHostCommunicationApi['copyToClipboard'] =
    async (text) => {
      if (!isNonEmptyString(text)) {
        return;
      }

      if (text.length > FRONT_COMPONENT_CLIPBOARD_MAX_LENGTH) {
        return;
      }

      const now = Date.now();
      if (
        now - lastCopyToClipboardCallAtRef.current <
        FRONT_COMPONENT_CLIPBOARD_RATE_LIMIT_MS
      ) {
        return;
      }
      lastCopyToClipboardCallAtRef.current = now;

      const preview =
        text.length > FRONT_COMPONENT_CLIPBOARD_PREVIEW_LENGTH
          ? `${text.slice(0, FRONT_COMPONENT_CLIPBOARD_PREVIEW_LENGTH)}…`
          : text;

      await copyToClipboardWithSnackbar(
        text,
        t`Application copied "${preview}" to your clipboard`,
      );
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
      updateProgress,
      copyToClipboard,
    };

  return {
    executionContext,
    frontComponentHostCommunicationApi,
  };
};
