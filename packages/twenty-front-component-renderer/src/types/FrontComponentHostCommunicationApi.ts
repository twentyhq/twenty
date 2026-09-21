import {
  type CloseSidePanelFunction,
  type CopyToClipboardFunction,
  type EnqueueSnackbarFunction,
  type HideSettingsBannerFunction,
  type NavigateFunction,
  type OpenCommandConfirmationModalHostFunction,
  type OpenSidePanelPageFunction,
  type RequestAccessTokenRefreshFunction,
  type ShowSettingsBannerHostFunction,
  type StorageClearFunction,
  type StorageDeleteFunction,
  type StorageSetFunction,
  type UnmountFrontComponentFunction,
  type UpdateProgressFunction,
  type UploadFileFunction,
} from 'twenty-sdk/front-component';

export type FrontComponentHostCommunicationApi = {
  navigate: NavigateFunction;
  requestAccessTokenRefresh: RequestAccessTokenRefreshFunction;
  openSidePanelPage: OpenSidePanelPageFunction;
  openCommandConfirmationModal: OpenCommandConfirmationModalHostFunction;
  unmountFrontComponent: UnmountFrontComponentFunction;
  enqueueSnackbar: EnqueueSnackbarFunction;
  closeSidePanel: CloseSidePanelFunction;
  updateProgress: UpdateProgressFunction;
  showSettingsBanner: ShowSettingsBannerHostFunction;
  hideSettingsBanner: HideSettingsBannerFunction;
  copyToClipboard: CopyToClipboardFunction;
  uploadFile: UploadFileFunction;
  storageSet: StorageSetFunction;
  storageDelete: StorageDeleteFunction;
  storageClear: StorageClearFunction;
};
