import {
  type CloseSidePanelFunction,
  type CopyToClipboardFunction,
  type EnqueueSnackbarFunction,
  type HideSettingsBannerFunction,
  type NavigateFunction,
  type OpenCommandConfirmationModalFunction,
  type OpenSidePanelPageFunction,
  type RequestAccessTokenRefreshFunction,
  type ShowSettingsBannerFunction,
  type StorageClearFunction,
  type StorageDeleteFunction,
  type StorageSetFunction,
  type UnmountFrontComponentFunction,
  type UpdateProgressFunction,
  type UploadFileFunction,
} from 'twenty-sdk/front-component';

export type WorkerFrontComponentHostCommunicationApi = {
  navigate?: NavigateFunction;
  requestAccessTokenRefresh?: RequestAccessTokenRefreshFunction;
  openSidePanelPage?: OpenSidePanelPageFunction;
  openCommandConfirmationModal?: OpenCommandConfirmationModalFunction;
  unmountFrontComponent?: UnmountFrontComponentFunction;
  enqueueSnackbar?: EnqueueSnackbarFunction;
  closeSidePanel?: CloseSidePanelFunction;
  updateProgress?: UpdateProgressFunction;
  showSettingsBanner?: ShowSettingsBannerFunction;
  hideSettingsBanner?: HideSettingsBannerFunction;
  copyToClipboard?: CopyToClipboardFunction;
  uploadFile?: UploadFileFunction;
  storageSet?: StorageSetFunction;
  storageDelete?: StorageDeleteFunction;
  storageClear?: StorageClearFunction;
};
