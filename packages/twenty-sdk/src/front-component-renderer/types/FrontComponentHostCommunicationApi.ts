import {
  type CloseSidePanelFunction,
  type EnqueueSnackbarFunction,
  type NavigateFunction,
  type OpenCommandConfirmationModalHostFunction,
  type OpenSidePanelPageFunction,
  type RequestAccessTokenRefreshFunction,
  type UnmountFrontComponentFunction,
  type UpdateProgressFunction,
} from '../../sdk/front-component-api/globals/frontComponentHostCommunicationApi';

export type FrontComponentHostCommunicationApi = {
  navigate: NavigateFunction;
  requestAccessTokenRefresh: RequestAccessTokenRefreshFunction;
  openSidePanelPage: OpenSidePanelPageFunction;
  openCommandConfirmationModal: OpenCommandConfirmationModalHostFunction;
  unmountFrontComponent: UnmountFrontComponentFunction;
  enqueueSnackbar: EnqueueSnackbarFunction;
  closeSidePanel: CloseSidePanelFunction;
  updateProgress: UpdateProgressFunction;
};
