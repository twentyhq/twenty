import { rejectPreviewHostActionOrThrow } from '@/host/thread/utils/rejectPreviewHostActionOrThrow';
import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';

export const FRONT_COMPONENT_PREVIEW_HOST_COMMUNICATION_API: FrontComponentHostCommunicationApi =
  {
    navigate: rejectPreviewHostActionOrThrow,
    requestAccessTokenRefresh: rejectPreviewHostActionOrThrow,
    openSidePanelPage: rejectPreviewHostActionOrThrow,
    openCommandConfirmationModal: rejectPreviewHostActionOrThrow,
    unmountFrontComponent: rejectPreviewHostActionOrThrow,
    enqueueSnackbar: rejectPreviewHostActionOrThrow,
    closeSidePanel: rejectPreviewHostActionOrThrow,
    updateProgress: rejectPreviewHostActionOrThrow,
    copyToClipboard: rejectPreviewHostActionOrThrow,
    setToolCallArguments: rejectPreviewHostActionOrThrow,
    uploadFile: rejectPreviewHostActionOrThrow,
    storageSet: rejectPreviewHostActionOrThrow,
    storageDelete: rejectPreviewHostActionOrThrow,
    storageClear: rejectPreviewHostActionOrThrow,
  };
