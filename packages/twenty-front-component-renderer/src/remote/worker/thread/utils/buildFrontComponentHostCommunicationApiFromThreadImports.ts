import { CustomError, isDefined } from 'twenty-shared/utils';
import { createOpenCommandConfirmationModalAdapter } from '@/remote/worker/thread/utils/createOpenCommandConfirmationModalAdapter';
import { type WorkerFrontComponentHostCommunicationApi } from '@/types/WorkerFrontComponentHostCommunicationApi';
import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';

export const buildFrontComponentHostCommunicationApiFromThreadImports = (
  hostThreadImports: FrontComponentHostCommunicationApi,
): Required<WorkerFrontComponentHostCommunicationApi> => ({
  queryMetadata: async (selection) => {
    if (!isDefined(hostThreadImports.queryMetadata)) {
      throw new CustomError(
        'Metadata preview queries are unavailable.',
        'FRONT_COMPONENT_PREVIEW_METADATA_UNAVAILABLE',
      );
    }
    return hostThreadImports.queryMetadata(selection);
  },
  navigate: hostThreadImports.navigate,
  requestAccessTokenRefresh: hostThreadImports.requestAccessTokenRefresh,
  openSidePanelPage: hostThreadImports.openSidePanelPage,
  openCommandConfirmationModal:
    createOpenCommandConfirmationModalAdapter(hostThreadImports),
  unmountFrontComponent: hostThreadImports.unmountFrontComponent,
  enqueueSnackbar: hostThreadImports.enqueueSnackbar,
  closeSidePanel: hostThreadImports.closeSidePanel,
  updateProgress: hostThreadImports.updateProgress,
  copyToClipboard: hostThreadImports.copyToClipboard,
  setToolCallArguments: hostThreadImports.setToolCallArguments,
  uploadFile: hostThreadImports.uploadFile,
  storageSet: hostThreadImports.storageSet,
  storageDelete: hostThreadImports.storageDelete,
  storageClear: hostThreadImports.storageClear,
});
