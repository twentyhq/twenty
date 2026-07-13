import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';

const noopAsync = async () => {};

export const FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP: FrontComponentHostCommunicationApi =
  {
    navigate: noopAsync,
    requestAccessTokenRefresh: async () => '',
    openSidePanelPage: noopAsync,
    openCommandConfirmationModal: noopAsync,
    unmountFrontComponent: noopAsync,
    enqueueSnackbar: noopAsync,
    closeSidePanel: noopAsync,
    updateProgress: noopAsync,
    copyToClipboard: noopAsync,
  };
