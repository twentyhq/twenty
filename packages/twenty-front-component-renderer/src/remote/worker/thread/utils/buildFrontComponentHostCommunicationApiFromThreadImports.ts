import { createOpenCommandConfirmationModalAdapter } from '@/remote/worker/thread/utils/createOpenCommandConfirmationModalAdapter';
import { type WorkerFrontComponentHostCommunicationApi } from '@/types/WorkerFrontComponentHostCommunicationApi';
import { type FrontComponentHostThreadExports } from '@/types/FrontComponentHostThreadExports';

export const buildFrontComponentHostCommunicationApiFromThreadImports = (
  hostThreadImports: FrontComponentHostThreadExports,
): Required<WorkerFrontComponentHostCommunicationApi> => ({
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
  storageSet: hostThreadImports.storageSet,
  storageDelete: hostThreadImports.storageDelete,
  storageClear: hostThreadImports.storageClear,
});
