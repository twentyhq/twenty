import {
  type CloseSidePanelFunction,
  type NavigateFunction,
  type OpenSidePanelPageFunction,
  type UnmountFrontComponentFunction,
} from '../../sdk/front-component-api/globals/frontComponentHostCommunicationApi';

export type FrontComponentHostCommunicationApi = {
  navigate: NavigateFunction;
  openSidePanelPage: OpenSidePanelPageFunction;
  unmountFrontComponent: UnmountFrontComponentFunction;
  closeSidePanel: CloseSidePanelFunction;
};
