import {
  type CloseSidePanelFunction,
  type EnqueueSnackbarFunction,
  type NavigateFunction,
  type OpenCommandConfirmationModalFunction,
  type OpenSidePanelPageFunction,
  type RequestAccessTokenRefreshFunction,
  type UnmountFrontComponentFunction,
  type UpdateProgressFunction,
} from 'twenty-sdk';

type FrontComponentHostCommunicationApiStore = {
  navigate?: NavigateFunction;
  requestAccessTokenRefresh?: RequestAccessTokenRefreshFunction;
  openSidePanelPage?: OpenSidePanelPageFunction;
  openCommandConfirmationModal?: OpenCommandConfirmationModalFunction;
  unmountFrontComponent?: UnmountFrontComponentFunction;
  enqueueSnackbar?: EnqueueSnackbarFunction;
  closeSidePanel?: CloseSidePanelFunction;
  updateProgress?: UpdateProgressFunction;
};

globalThis.frontComponentHostCommunicationApi ??= {};

export const frontComponentHostCommunicationApi: FrontComponentHostCommunicationApiStore =
  globalThis.frontComponentHostCommunicationApi;
