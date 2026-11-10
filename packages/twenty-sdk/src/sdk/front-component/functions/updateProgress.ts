import { isDefined } from 'twenty-shared/primitives';

import {
  frontComponentHostCommunicationApi,
  type UpdateProgressFunction,
} from '../globals/frontComponentHostCommunicationApi';

export const updateProgress: UpdateProgressFunction = (progress) => {
  const updateProgressFunction =
    frontComponentHostCommunicationApi.updateProgress;

  if (!isDefined(updateProgressFunction)) {
    throw new Error('updateProgressFunction is not set');
  }

  return updateProgressFunction(progress);
};
