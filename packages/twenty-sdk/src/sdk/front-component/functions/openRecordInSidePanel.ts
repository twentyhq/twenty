import { isDefined } from 'twenty-shared/utils';

import {
  frontComponentHostCommunicationApi,
  type OpenRecordInSidePanelFunction,
} from '../globals/frontComponentHostCommunicationApi';

export const openRecordInSidePanel: OpenRecordInSidePanelFunction = (
  params,
) => {
  const openRecordInSidePanelFunction =
    frontComponentHostCommunicationApi.openRecordInSidePanel;

  if (!isDefined(openRecordInSidePanelFunction)) {
    throw new Error('openRecordInSidePanelFunction is not set');
  }

  return openRecordInSidePanelFunction(params);
};
