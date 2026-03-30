import {
  type AppPath,
  type SidePanelPages,
  type EnqueueSnackbarParams,
  type NavigateOptions,
} from 'twenty-shared/types';
import { type getAppPath } from 'twenty-shared/utils';

export type NavigateFunction = <T extends AppPath>(
  to: T,
  params?: Parameters<typeof getAppPath<T>>[1],
  queryParams?: Record<string, any>,
  options?: NavigateOptions,
) => Promise<void>;

export type OpenSidePanelPageFunction = (params: {
  page: SidePanelPages;
  pageTitle: string;
  pageIcon?: string;
  shouldResetSearchState?: boolean;
}) => Promise<void>;

export type CommandConfirmationModalResult = 'confirm' | 'cancel';

export type CommandConfirmationModalAccent = 'default' | 'blue' | 'danger';

export type OpenCommandConfirmationModalFunction = (params: {
  title: string;
  subtitle: string;
  confirmButtonText?: string;
  confirmButtonAccent?: CommandConfirmationModalAccent;
}) => Promise<CommandConfirmationModalResult>;

export type UnmountFrontComponentFunction = () => Promise<void>;

export type EnqueueSnackbarFunction = (
  params: EnqueueSnackbarParams,
) => Promise<void>;

export type CloseSidePanelFunction = () => Promise<void>;

export type UpdateProgressFunction = (progress: number) => Promise<void>;

export type RequestAccessTokenRefreshFunction = () => Promise<string>;

export type OpenCommandConfirmationModalHostFunction = (
  params: Parameters<OpenCommandConfirmationModalFunction>[0],
) => Promise<void>;

export type FrontComponentHostCommunicationApiStore = {
  navigate?: NavigateFunction;
  requestAccessTokenRefresh?: RequestAccessTokenRefreshFunction;
  openSidePanelPage?: OpenSidePanelPageFunction;
  openCommandConfirmationModal?: OpenCommandConfirmationModalFunction;
  unmountFrontComponent?: UnmountFrontComponentFunction;
  enqueueSnackbar?: EnqueueSnackbarFunction;
  closeSidePanel?: CloseSidePanelFunction;
  updateProgress?: UpdateProgressFunction;
};

import { FRONT_COMPONENT_HOST_COMMUNICATION_API_KEY } from '../constants/front-component-host-communication-api-key';

declare global {
  var frontComponentHostCommunicationApi: FrontComponentHostCommunicationApiStore;
}

globalThis[FRONT_COMPONENT_HOST_COMMUNICATION_API_KEY] ??= {};

export const frontComponentHostCommunicationApi =
  globalThis.frontComponentHostCommunicationApi;
