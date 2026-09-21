import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';

export const FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP: FrontComponentHostCommunicationApi =
  {
    navigate: async () => {},
    requestAccessTokenRefresh: async () => '',
    openSidePanelPage: async () => {},
    openCommandConfirmationModal: async () => {},
    unmountFrontComponent: async () => {},
    enqueueSnackbar: async () => {},
    closeSidePanel: async () => {},
    updateProgress: async () => {},
    showSettingsBanner: async () => {},
    hideSettingsBanner: async () => {},
    copyToClipboard: async () => {},
    uploadFile: async () => ({ status: 'failed', reason: 'upload-failed' }),
    storageSet: async () => {},
    storageDelete: async () => {},
    storageClear: async () => {},
  };
