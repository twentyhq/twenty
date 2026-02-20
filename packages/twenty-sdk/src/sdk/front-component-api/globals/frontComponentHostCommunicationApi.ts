import { type AppPath, type NavigateOptions } from 'twenty-shared/types';
import { type getAppPath } from 'twenty-shared/utils';

import { type OpenSidePanelPageParams } from '../functions/openSidePanelPage';

export type NavigateFunction = <T extends AppPath>(
  to: T,
  params?: Parameters<typeof getAppPath<T>>[1],
  queryParams?: Record<string, any>,
  options?: NavigateOptions,
) => Promise<void>;

export type OpenSidePanelPageFunction = (
  params: OpenSidePanelPageParams,
) => Promise<void>;

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
