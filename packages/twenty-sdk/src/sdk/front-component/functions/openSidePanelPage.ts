import { isDefined } from 'twenty-shared/utils';

import {
  frontComponentHostCommunicationApi,
  type OpenSidePanelPageFunction,
} from '../globals/frontComponentHostCommunicationApi';

export const openSidePanelPage: OpenSidePanelPageFunction = (params) => {
  const openSidePanelPageFunction =
    frontComponentHostCommunicationApi.openSidePanelPage;

  if (!isDefined(openSidePanelPageFunction)) {
    throw new Error('openSidePanelPageFunction is not set');
  }

  return openSidePanelPageFunction(params);
};
