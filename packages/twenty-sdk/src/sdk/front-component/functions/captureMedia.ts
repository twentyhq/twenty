import { isDefined } from 'twenty-shared/utils';

import {
  type CaptureMediaFunction,
  frontComponentHostCommunicationApi,
} from '../globals/frontComponentHostCommunicationApi';

export const captureMedia: CaptureMediaFunction = (params) => {
  const captureMediaFunction = frontComponentHostCommunicationApi.captureMedia;

  if (!isDefined(captureMediaFunction)) {
    throw new Error('captureMediaFunction is not set');
  }

  return captureMediaFunction(params);
};
