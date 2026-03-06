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

export type ActionConfirmationModalResult = 'confirm' | 'cancel';

export type ActionConfirmationModalAccent = 'default' | 'blue' | 'danger';

export type OpenActionConfirmationModalFunction = (params: {
  title: string;
  subtitle: string;
  confirmButtonText?: string;
  confirmButtonAccent?: ActionConfirmationModalAccent;
}) => Promise<ActionConfirmationModalResult>;

export type UnmountFrontComponentFunction = () => Promise<void>;

export type EnqueueSnackbarFunction = (
  params: EnqueueSnackbarParams,
) => Promise<void>;

export type CloseSidePanelFunction = () => Promise<void>;

export type RequestAccessTokenRefreshFunction = () => Promise<string>;

export type OpenActionConfirmationModalHostFunction = (
  params: Parameters<OpenActionConfirmationModalFunction>[0],
) => Promise<void>;

export type FrontComponentHostCommunicationApiStore = {
  navigate?: NavigateFunction;
  requestAccessTokenRefresh?: RequestAccessTokenRefreshFunction;
  openSidePanelPage?: OpenSidePanelPageFunction;
  openActionConfirmationModal?: OpenActionConfirmationModalFunction;
  unmountFrontComponent?: UnmountFrontComponentFunction;
  enqueueSnackbar?: EnqueueSnackbarFunction;
  closeSidePanel?: CloseSidePanelFunction;
};

declare global {
  var frontComponentHostCommunicationApi: FrontComponentHostCommunicationApiStore;
}

globalThis.frontComponentHostCommunicationApi ??= {};

export const frontComponentHostCommunicationApi =
  globalThis.frontComponentHostCommunicationApi;
