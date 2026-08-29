import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { resolveOpenRecordIn } from '@/object-record/record-index/utils/resolveOpenRecordIn';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isNonEmptyString } from '@sniptt/guards';
import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';
import {
  buildFrontComponentStorageNamespace,
  clearFrontComponentStorage,
  deleteFrontComponentStorageItem,
  type FrontComponentExecutionContext,
  type FrontComponentHostCommunicationApi,
  setFrontComponentStorageItem,
} from 'twenty-front-component-renderer';
import {
  AppPath,
  FieldMetadataType,
  ObjectOpenRecordIn,
  OpenRecordIn,
  SidePanelPages,
  type EnqueueSnackbarParams,
} from 'twenty-shared/types';
import { type AppLocale } from 'twenty-shared/translations';

import { useOpenAskAiPageWithPreprompt } from '@/ai/hooks/useOpenAskAiPageWithPreprompt';
import { currentUserState } from '@/auth/states/currentUserState';
import { useCommandMenuConfirmationModal } from '@/command-menu-item/confirmation-modal/hooks/useCommandMenuConfirmationModal';
import { useUnmountCommand } from '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand';
import { commandMenuItemProgressFamilyState } from '@/command-menu-item/states/commandMenuItemProgressFamilyState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { getMediaFileExtension } from '@/front-components/media-session/utils/getMediaFileExtension';
import { useRequestApplicationTokenRefresh } from '@/front-components/hooks/useRequestApplicationTokenRefresh';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useOpenComposeEmailInSidePanel } from '@/side-panel/hooks/useOpenComposeEmailInSidePanel';
import { useOpenFrontComponentInSidePanel } from '@/side-panel/hooks/useOpenFrontComponentInSidePanel';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useOpenRichTextInSidePanel } from '@/side-panel/hooks/useOpenRichTextInSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { setRecordPageActiveTabId } from '@/page-layout/utils/setRecordPageActiveTabId';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useStore } from 'jotai';
import { assertUnreachable, CustomError, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { useIsMobile } from 'twenty-ui/utilities';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { FileFolder } from '~/generated-metadata/graphql';

const FRONT_COMPONENT_CLIPBOARD_MAX_LENGTH = 64 * 1024;
const FRONT_COMPONENT_CLIPBOARD_RATE_LIMIT_MS = 1000;
const FRONT_COMPONENT_CLIPBOARD_PREVIEW_LENGTH = 30;

const FRONT_COMPONENT_UPLOAD_FILE_NAME_MAX_LENGTH = 200;

const sanitizeUploadFileName = (fileName: string, mimeType: string): string => {
  const withoutSeparators = fileName.replace(/[/\\\u0000-\u001f]/g, '').trim();

  if (withoutSeparators === '') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    return `upload-${timestamp}.${getMediaFileExtension(mimeType)}`;
  }

  return withoutSeparators.slice(
    0,
    FRONT_COMPONENT_UPLOAD_FILE_NAME_MAX_LENGTH,
  );
};

export const useFrontComponentExecutionContext = ({
  frontComponentId,
  applicationId,
  commandMenuItemId,
  selectedRecordIds,
  timelineActivityId,
  colorScheme,
}: {
  frontComponentId: string;
  applicationId: string;
  commandMenuItemId?: string;
  selectedRecordIds?: string[];
  timelineActivityId?: string;
  colorScheme: 'light' | 'dark';
}): {
  executionContext: FrontComponentExecutionContext;
  frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi;
  storageNamespace?: string;
} => {
  const currentUser = useAtomStateValue(currentUserState);
  const navigateApp = useNavigateApp();
  const store = useStore();
  const { requestAccessTokenRefresh } = useRequestApplicationTokenRefresh({
    frontComponentId,
  });
  const { openConfirmationModal } = useCommandMenuConfirmationModal();
  const { openAskAiPageWithPreprompt } = useOpenAskAiPageWithPreprompt();
  const { navigateSidePanel } = useNavigateSidePanel();
  const { openRecordInSidePanel: openRecordInSidePanelInternal } =
    useOpenRecordInSidePanel();
  const { openRichTextInSidePanel } = useOpenRichTextInSidePanel();
  const { openComposeEmailInSidePanel } = useOpenComposeEmailInSidePanel();
  const { openFrontComponentInSidePanel } = useOpenFrontComponentInSidePanel();
  const isMobile = useIsMobile();
  const { objectMetadataItems } = useObjectMetadataItems();
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
  const { uploadFile: uploadFileToFilesField } = useDirectFileUpload();
  const { t, i18n } = useLingui();
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
      if (params.page === SidePanelPages.ViewRecord) {
        const { recordId, objectNameSingular, tab, resetNavigationStack } =
          params;

        const objectMetadataItem = objectMetadataItems.find(
          (item) => item.nameSingular === objectNameSingular,
        );

        const resolvedOpenRecordIn = resolveOpenRecordIn({
          objectOpenRecordIn:
            objectMetadataItem?.openRecordIn ?? ObjectOpenRecordIn.USER_CHOICE,
          openRecordInPreference: OpenRecordIn.SIDE_PANEL,
          canDisplaySidePanel: !isMobile,
        });

        if (resolvedOpenRecordIn === OpenRecordIn.RECORD_PAGE) {
          if (isDefined(tab)) {
            setRecordPageActiveTabId({
              recordId,
              objectNameSingular,
              tabId: tab,
              store,
            });
          }

          await navigate(AppPath.RecordShowPage, {
            objectNameSingular,
            objectRecordId: recordId,
          });

          return;
        }

        openRecordInSidePanelInternal({
          recordId,
          objectNameSingular,
          tab,
          resetNavigationStack,
        });

        return;
      }

      if (params.page === SidePanelPages.EditRichText) {
        openRichTextInSidePanel(
          params.recordId,
          params.objectNameSingular,
          params.fieldName,
        );

        return;
      }

      if (params.page === SidePanelPages.ComposeEmail) {
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

      if (params.page === SidePanelPages.ViewFrontComponent) {
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

      if (
        params.page === SidePanelPages.AskAI &&
        isDefined(params.preprompt) &&
        isNonEmptyString(params.preprompt.text)
      ) {
        openAskAiPageWithPreprompt({
          text: params.preprompt.text,
          mode: params.preprompt.mode,
          model: params.preprompt.model,
        });

        if (params.shouldResetSearchState === true) {
          setSidePanelSearch('');
        }

        return;
      }

      navigateSidePanel({
        page: params.page,
        pageTitle: params.pageTitle,
        pageIcon: getIcon(params.pageIcon),
      });

      if (params.shouldResetSearchState === true) {
        setSidePanelSearch('');
      }
    };

  const openCommandConfirmationModal: FrontComponentHostCommunicationApi['openCommandConfirmationModal'] =
    async ({
      title,
      subtitle,
      confirmButtonText,
      confirmButtonAccent = 'danger',
    }) => {
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
    timelineActivityId: timelineActivityId ?? null,
    colorScheme,
    // i18n.locale is a Lingui string; the host is always configured with the
    // APP_LOCALES set, so it is a valid AppLocale.
    locale: i18n.locale as AppLocale,
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

  const hostUploadFile: FrontComponentHostCommunicationApi['uploadFile'] =
    async (file, params) => {
      // Arguments come from sandboxed application code: reject malformed
      // shapes here. fieldMetadataId is mandatory — a file uploaded outside
      // a FILES field could never be attached to a record and would leak.
      if (
        !(file instanceof Blob) ||
        file.size === 0 ||
        !isDefined(params) ||
        !isNonEmptyString(params.fieldMetadataId)
      ) {
        return { status: 'failed', reason: 'invalid-params' };
      }

      // A non-FILES target would upload fine and then fail at attach time,
      // stranding the file; reject it before uploading anything.
      const { fieldMetadataItem } = getFieldMetadataItemById({
        fieldMetadataId: params.fieldMetadataId,
        objectMetadataItems,
      });

      if (fieldMetadataItem?.type !== FieldMetadataType.FILES) {
        return { status: 'failed', reason: 'invalid-params' };
      }

      const fileName = sanitizeUploadFileName(
        isNonEmptyString(params.fileName) ? params.fileName : '',
        file.type,
      );

      try {
        const uploadedFile = await uploadFileToFilesField(
          new File([file], fileName, { type: file.type }),
          {
            fileFolder: FileFolder.FilesField,
            fieldMetadataId: params.fieldMetadataId,
          },
        );

        return {
          status: 'uploaded',
          file: {
            fileId: uploadedFile.id,
            path: uploadedFile.path,
            url: uploadedFile.url,
            size: uploadedFile.size,
            mimeType: file.type.split(';')[0],
          },
        };
      } catch {
        return { status: 'failed', reason: 'upload-failed' };
      }
    };

  const currentUserId = currentUser?.id;

  const storageNamespace = isDefined(currentUserId)
    ? buildFrontComponentStorageNamespace({
        applicationId,
        userId: currentUserId,
      })
    : undefined;

  const requireStorageNamespace = (): string => {
    if (!isDefined(storageNamespace)) {
      throw new CustomError(
        'Device storage requires a signed-in user',
        'FRONT_COMPONENT_STORAGE_REQUIRES_SIGNED_IN_USER',
      );
    }

    return storageNamespace;
  };

  const storageSet: FrontComponentHostCommunicationApi['storageSet'] = async ({
    storageType,
    key,
    serializedValue,
  }) => {
    setFrontComponentStorageItem({
      namespace: requireStorageNamespace(),
      storageType,
      key,
      serializedValue,
    });
  };

  const storageDelete: FrontComponentHostCommunicationApi['storageDelete'] =
    async ({ storageType, key }) => {
      deleteFrontComponentStorageItem({
        namespace: requireStorageNamespace(),
        storageType,
        key,
      });
    };

  const storageClear: FrontComponentHostCommunicationApi['storageClear'] =
    async ({ storageType }) => {
      clearFrontComponentStorage({
        namespace: requireStorageNamespace(),
        storageType,
      });
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
      uploadFile: hostUploadFile,
      storageSet,
      storageDelete,
      storageClear,
    };

  return {
    executionContext,
    frontComponentHostCommunicationApi,
    storageNamespace,
  };
};
