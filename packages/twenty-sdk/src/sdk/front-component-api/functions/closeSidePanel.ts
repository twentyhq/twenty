import { isDefined } from 'twenty-shared/utils';

import {
  type CloseSidePanelFunction,
  frontComponentHostCommunicationApi,
} from '../globals/frontComponentHostCommunicationApi';

export const closeSidePanel: CloseSidePanelFunction = () => {
  const closeSidePanelFunction =
    frontComponentHostCommunicationApi.closeSidePanel;

  if (!isDefined(closeSidePanelFunction)) {
    throw new Error('closeSidePanelFunction is not set');
  }

  return closeSidePanelFunction();
};
