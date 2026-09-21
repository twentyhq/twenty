import { createHideSettingsBannerAdapter } from '@/remote/worker/thread/utils/createHideSettingsBannerAdapter';
import { createOpenCommandConfirmationModalAdapter } from '@/remote/worker/thread/utils/createOpenCommandConfirmationModalAdapter';
import { createShowSettingsBannerAdapter } from '@/remote/worker/thread/utils/createShowSettingsBannerAdapter';
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
  showSettingsBanner: createShowSettingsBannerAdapter(hostThreadImports),
  hideSettingsBanner: createHideSettingsBannerAdapter(hostThreadImports),
  copyToClipboard: hostThreadImports.copyToClipboard,
  uploadFile: hostThreadImports.uploadFile,
  storageSet: hostThreadImports.storageSet,
  storageDelete: hostThreadImports.storageDelete,
  storageClear: hostThreadImports.storageClear,
});
