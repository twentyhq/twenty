import { type CommandMenuPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  frontComponentHostCommunicationApi,
  type OpenSidePanelPageFunction,
} from '../globals/frontComponentHostCommunicationApi';

export type OpenSidePanelPageParams = {
  page: CommandMenuPages;
  pageTitle: string;
  pageIcon?: string;
  shouldResetSearchState?: boolean;
};

export const setOpenSidePanelPage = (fn: OpenSidePanelPageFunction): void => {
  frontComponentHostCommunicationApi.openSidePanelPage = fn;
};

export const openSidePanelPage: OpenSidePanelPageFunction = (
  params: OpenSidePanelPageParams,
): Promise<void> => {
  const openSidePanelPageFunction =
    frontComponentHostCommunicationApi.openSidePanelPage;

  if (!isDefined(openSidePanelPageFunction)) {
    throw new Error('openSidePanelPageFunction is not set');
  }

  return openSidePanelPageFunction(params);
};
