import { createOpenCommandConfirmationModalAdapter } from '@/remote/worker/utils/createCommandConfirmationModalBridge';
import { type FrontComponentHostCommunicationApiStore } from '@/types/FrontComponentHostCommunicationApiStore';
import { type FrontComponentHostThreadExports } from '@/types/FrontComponentHostThreadExports';

export const buildFrontComponentHostCommunicationApiFromThreadImports = (
  hostThreadImports: FrontComponentHostThreadExports,
): Required<FrontComponentHostCommunicationApiStore> => ({
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
  startMediaRecording: hostThreadImports.startMediaRecording,
  stopMediaRecording: hostThreadImports.stopMediaRecording,
  cancelMediaRecording: hostThreadImports.cancelMediaRecording,
  storageSet: hostThreadImports.storageSet,
  storageDelete: hostThreadImports.storageDelete,
  storageClear: hostThreadImports.storageClear,
});
