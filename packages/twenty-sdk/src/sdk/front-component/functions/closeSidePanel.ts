import { isDefined } from 'twenty-shared/primitives';

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
