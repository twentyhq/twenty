import {
  type CloseSidePanelFunction,
  type CopyToClipboardFunction,
  type EnqueueSnackbarFunction,
  type NavigateFunction,
  type OpenCommandConfirmationModalHostFunction,
  type OpenSidePanelPageFunction,
  type ReadFrontComponentFileFunction,
  type RequestAccessTokenRefreshFunction,
  type UnmountFrontComponentFunction,
  type UpdateProgressFunction,
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
  copyToClipboard: CopyToClipboardFunction;
  readFrontComponentFile: ReadFrontComponentFileFunction;
};
