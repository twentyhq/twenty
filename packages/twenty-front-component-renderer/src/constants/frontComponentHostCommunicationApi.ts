import {
  type CloseSidePanelFunction,
  type EnqueueSnackbarFunction,
  FRONT_COMPONENT_HOST_COMMUNICATION_API_KEY,
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

(globalThis as Record<string, unknown>)[
  FRONT_COMPONENT_HOST_COMMUNICATION_API_KEY
] ??= {};

export const frontComponentHostCommunicationApi: FrontComponentHostCommunicationApiStore =
  (globalThis as Record<string, unknown>)[
    FRONT_COMPONENT_HOST_COMMUNICATION_API_KEY
  ] as FrontComponentHostCommunicationApiStore;
