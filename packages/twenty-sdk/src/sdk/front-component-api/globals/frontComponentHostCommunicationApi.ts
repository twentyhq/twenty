import {
  type AppPath,
  type CommandMenuPages,
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
  page: CommandMenuPages;
  pageTitle: string;
  pageIcon?: string;
  shouldResetSearchState?: boolean;
}) => Promise<void>;

export type UnmountFrontComponentFunction = () => Promise<void>;

export type FrontComponentHostCommunicationApiStore = {
  navigate?: NavigateFunction;
  openSidePanelPage?: OpenSidePanelPageFunction;
  unmountFrontComponent?: UnmountFrontComponentFunction;
};

declare global {
  var frontComponentHostCommunicationApi: FrontComponentHostCommunicationApiStore;
}

globalThis.frontComponentHostCommunicationApi ??= {};

export const frontComponentHostCommunicationApi =
  globalThis.frontComponentHostCommunicationApi;
