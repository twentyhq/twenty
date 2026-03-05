import {
  type CloseSidePanelFunction,
  type EnqueueSnackbarFunction,
  type NavigateFunction,
  type OpenActionConfirmationModalHostFunction,
  type OpenSidePanelPageFunction,
  type RequestAccessTokenRefreshFunction,
  type UnmountFrontComponentFunction,
} from '../../sdk/front-component-api/globals/frontComponentHostCommunicationApi';

export type FrontComponentHostCommunicationApi = {
  navigate: NavigateFunction;
  requestAccessTokenRefresh: RequestAccessTokenRefreshFunction;
  openSidePanelPage: OpenSidePanelPageFunction;
  openActionConfirmationModal: OpenActionConfirmationModalHostFunction;
  unmountFrontComponent: UnmountFrontComponentFunction;
  enqueueSnackbar: EnqueueSnackbarFunction;
  closeSidePanel: CloseSidePanelFunction;
};
