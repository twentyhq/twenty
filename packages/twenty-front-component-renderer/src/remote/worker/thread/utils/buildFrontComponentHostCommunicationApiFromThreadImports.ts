import { FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP } from '@/host/thread/constants/FrontComponentHostCommunicationApiNoop';
import { rejectPreviewHostActionOrThrow } from '@/host/thread/utils/rejectPreviewHostActionOrThrow';
import { type WorkerFrontComponentHostCommunicationApi } from '@/types/WorkerFrontComponentHostCommunicationApi';
import { createOpenCommandConfirmationModalAdapter } from '@/remote/worker/thread/utils/createOpenCommandConfirmationModalAdapter';
import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';

export const buildFrontComponentHostCommunicationApiFromThreadImports = (
  hostThreadImports: FrontComponentHostCommunicationApi,
): Required<WorkerFrontComponentHostCommunicationApi> => ({
  queryMetadata:
    hostThreadImports.queryMetadata ?? rejectPreviewHostActionOrThrow,
  navigate: hostThreadImports.navigate,
  getObjectMetadata:
    hostThreadImports.getObjectMetadata ??
    FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP.getObjectMetadata,
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
