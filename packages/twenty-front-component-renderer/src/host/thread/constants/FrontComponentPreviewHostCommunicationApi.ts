import { rejectPreviewHostAction } from '@/host/thread/utils/rejectPreviewHostAction';
import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';

export const FRONT_COMPONENT_PREVIEW_HOST_COMMUNICATION_API: FrontComponentHostCommunicationApi =
  {
    navigate: rejectPreviewHostAction,
    requestAccessTokenRefresh: rejectPreviewHostAction,
    openSidePanelPage: rejectPreviewHostAction,
    openCommandConfirmationModal: rejectPreviewHostAction,
    unmountFrontComponent: rejectPreviewHostAction,
    enqueueSnackbar: rejectPreviewHostAction,
    closeSidePanel: rejectPreviewHostAction,
    updateProgress: rejectPreviewHostAction,
    copyToClipboard: rejectPreviewHostAction,
    setToolCallArguments: rejectPreviewHostAction,
    uploadFile: rejectPreviewHostAction,
    storageSet: rejectPreviewHostAction,
    storageDelete: rejectPreviewHostAction,
    storageClear: rejectPreviewHostAction,
  };
