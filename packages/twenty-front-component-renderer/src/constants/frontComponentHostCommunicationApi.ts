import {
  type CloseSidePanelFunction,
  type CopyToClipboardFunction,
  type EnqueueSnackbarFunction,
  type NavigateFunction,
  type OpenCommandConfirmationModalFunction,
  type OpenSidePanelPageFunction,
  type ReadFrontComponentFileFunction,
  type RequestAccessTokenRefreshFunction,
  type UnmountFrontComponentFunction,
  type UpdateProgressFunction,
} from 'twenty-sdk/front-component';

import { FRONT_COMPONENT_HOST_COMMUNICATION_API_KEY } from 'twenty-sdk/front-component-renderer';

type FrontComponentHostCommunicationApiStore = {
  navigate?: NavigateFunction;
  requestAccessTokenRefresh?: RequestAccessTokenRefreshFunction;
  openSidePanelPage?: OpenSidePanelPageFunction;
  openCommandConfirmationModal?: OpenCommandConfirmationModalFunction;
  unmountFrontComponent?: UnmountFrontComponentFunction;
  enqueueSnackbar?: EnqueueSnackbarFunction;
  closeSidePanel?: CloseSidePanelFunction;
  updateProgress?: UpdateProgressFunction;
  copyToClipboard?: CopyToClipboardFunction;
  readFrontComponentFile?: ReadFrontComponentFileFunction;
};

(globalThis as Record<string, unknown>)[
  FRONT_COMPONENT_HOST_COMMUNICATION_API_KEY
] ??= {};

export const frontComponentHostCommunicationApi: FrontComponentHostCommunicationApiStore =
  (globalThis as Record<string, unknown>)[
    FRONT_COMPONENT_HOST_COMMUNICATION_API_KEY
  ] as FrontComponentHostCommunicationApiStore;
