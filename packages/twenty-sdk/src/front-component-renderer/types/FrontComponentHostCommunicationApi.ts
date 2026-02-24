import {
  type CloseSidePanelFunction,
  type EnqueueSnackbarFunction,
  type NavigateFunction,
  type OpenSidePanelPageFunction,
  type UnmountFrontComponentFunction,
} from '../../sdk/front-component-api/globals/frontComponentHostCommunicationApi';

export type FrontComponentHostCommunicationApi = {
  navigate: NavigateFunction;
  openSidePanelPage: OpenSidePanelPageFunction;
  unmountFrontComponent: UnmountFrontComponentFunction;
  enqueueSnackbar: EnqueueSnackbarFunction;
  closeSidePanel: CloseSidePanelFunction;
};
