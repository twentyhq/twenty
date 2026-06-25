import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isNonEmptyString } from '@sniptt/guards';
import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';
import {
  type FrontComponentExecutionContext,
  type FrontComponentHostCommunicationApi,
} from 'twenty-front-component-renderer';
import {
  AppPath,
  SidePanelPages,
  type EnqueueSnackbarParams,
} from 'twenty-shared/types';

import { currentUserState } from '@/auth/states/currentUserState';
import { useCommandMenuConfirmationModal } from '@/command-menu-item/confirmation-modal/hooks/useCommandMenuConfirmationModal';
import { useUnmountCommand } from '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand';
import { commandMenuItemProgressFamilyState } from '@/command-menu-item/states/commandMenuItemProgressFamilyState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { useRequestApplicationTokenRefresh } from '@/front-components/hooks/useRequestApplicationTokenRefresh';
import { canOpenObjectInSidePanel } from '@/object-record/utils/canOpenObjectInSidePanel';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useOpenComposeEmailInSidePanel } from '@/side-panel/hooks/useOpenComposeEmailInSidePanel';
import { useOpenFrontComponentInSidePanel } from '@/side-panel/hooks/useOpenFrontComponentInSidePanel';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useOpenRichTextInSidePanel } from '@/side-panel/hooks/useOpenRichTextInSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useStore } from 'jotai';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { useIsMobile } from 'twenty-ui/utilities';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const FRONT_COMPONENT_CLIPBOARD_MAX_LENGTH = 64 * 1024;
const FRONT_COMPONENT_CLIPBOARD_RATE_LIMIT_MS = 1000;
const FRONT_COMPONENT_CLIPBOARD_PREVIEW_LENGTH = 30;

export const useFrontComponentExecutionContext = ({
  frontComponentId,
  commandMenuItemId,
  selectedRecordIds,
  colorScheme,
}: {
  frontComponentId: string;
  commandMenuItemId?: string;
  selectedRecordIds?: string[];
  colorScheme: 'light' | 'dark';
}): {
  executionContext: FrontComponentExecutionContext;
  frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi;
} => {
  const currentUser = useAtomStateValue(currentUserState);
  const navigateApp = useNavigateApp();
  const store = useStore();
  const { requestAccessTokenRefresh } = useRequestApplicationTokenRefresh({
    frontComponentId,
  });
  const { openConfirmationModal } = useCommandMenuConfirmationModal();
  const { navigateSidePanel } = useNavigateSidePanel();
  const { openRecordInSidePanel: openRecordInSidePanelInternal } =
    useOpenRecordInSidePanel();
  const { openRichTextInSidePanel } = useOpenRichTextInSidePanel();
  const { openComposeEmailInSidePanel } = useOpenComposeEmailInSidePanel();
  const { openFrontComponentInSidePanel } = useOpenFrontComponentInSidePanel();
  const isMobile = useIsMobile();
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
    if (to === AppPath.RecordShowPage) {
      const targetObjectNameSingular = (
        params as { objectNameSingular?: string | null } | undefined
      )?.objectNameSingular;

      const parentViewAtom =
        contextStoreRecordShowParentViewComponentState.atomFamily({
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        });

      const parentView = store.get(parentViewAtom);

      if (
        isDefined(parentView) &&
        isDefined(targetObjectNameSingular) &&
        parentView.parentViewObjectNameSingular !== targetObjectNameSingular
      ) {
        store.set(parentViewAtom, undefined);
      }
    }

    navigateApp(
      to as AppPath,
      params as Parameters<typeof navigateApp>[1],
      queryParams,
      options,
    );
  };

  const openSidePanelPage: FrontComponentHostCommunicationApi['openSidePanelPage'] =
    async (params) => {
      switch (params.page) {
        case SidePanelPages.ViewRecord: {
          const { recordId, objectNameSingular, resetNavigationStack } = params;

          if (isMobile || !canOpenObjectInSidePanel(objectNameSingular)) {
            await navigate(AppPath.RecordShowPage, {
              objectNameSingular,
              objectRecordId: recordId,
            });

            return;
          }

          openRecordInSidePanelInternal({
            recordId,
            objectNameSingular,
            resetNavigationStack,
          });

          return;
        }
        case SidePanelPages.EditRichText: {
          openRichTextInSidePanel(
            params.recordId,
            params.objectNameSingular,
            params.fieldName,
          );

          return;
        }
        case SidePanelPages.ComposeEmail: {
          openComposeEmailInSidePanel({
            connectedAccountId: params.connectedAccountId,
            threadId: params.threadId,
            defaultTo: params.defaultTo,
            defaultSubject: params.defaultSubject,
            defaultInReplyTo: params.defaultInReplyTo,
            pageTitle: params.pageTitle,
            pageIcon: isDefined(params.pageIcon)
              ? getIcon(params.pageIcon)
              : undefined,
          });

          return;
        }
        case SidePanelPages.ViewFrontComponent: {
          const recordContext =
            isDefined(params.recordId) && isDefined(params.objectNameSingular)
              ? {
                  recordId: params.recordId,
                  objectNameSingular: params.objectNameSingular,
                }
              : undefined;

          openFrontComponentInSidePanel({
            frontComponentId: params.frontComponentId,
            pageTitle: params.pageTitle,
            pageIcon: getIcon(params.pageIcon),
            resetNavigationStack: params.resetNavigationStack,
            recordContext,
          });

          return;
        }
        default: {
          navigateSidePanel({
            page: params.page,
            pageTitle: params.pageTitle,
            pageIcon: getIcon(params.pageIcon),
          });

          if (params.shouldResetSearchState === true) {
            setSidePanelSearch('');
          }

          return;
        }
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
    colorScheme,
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
