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
    copyToClipboard: async () => {},
    storageSet: async () => {},
    storageDelete: async () => {},
    storageClear: async () => {},
  };
