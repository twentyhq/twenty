import { isDefined } from 'twenty-shared/utils';

import {
  frontComponentHostCommunicationApi,
  type OpenUrlFunction,
} from '../globals/frontComponentHostCommunicationApi';

export const openUrl: OpenUrlFunction = (url: string) => {
  const openUrlFunction = frontComponentHostCommunicationApi.openUrl;

  if (!isDefined(openUrlFunction)) {
    throw new Error('openUrlFunction is not set');
  }

  return openUrlFunction(url);
};
