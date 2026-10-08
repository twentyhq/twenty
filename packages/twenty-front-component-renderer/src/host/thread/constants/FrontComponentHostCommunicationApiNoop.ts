import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';
import { CustomError } from 'twenty-shared/utils';

export const FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP: Required<FrontComponentHostCommunicationApi> =
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
    uploadFile: async () => ({ status: 'failed', reason: 'upload-failed' }),
    storageSet: async () => {},
    storageDelete: async () => {},
    storageClear: async () => {},
    getUserApplicationVariables: async () => {
      throw new CustomError(
        'User application variables are only available in personal app settings',
        'FRONT_COMPONENT_USER_PREFERENCES_UNAVAILABLE',
      );
    },
    updateUserApplicationVariable: async () => {
      throw new CustomError(
        'User application variables are only available in personal app settings',
        'FRONT_COMPONENT_USER_PREFERENCES_UNAVAILABLE',
      );
    },
  };
