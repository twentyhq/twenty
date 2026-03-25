import { isDefined } from 'twenty-shared/utils';

import {
  frontComponentHostCommunicationApi,
  type UnmountFrontComponentFunction,
} from '../globals/frontComponentHostCommunicationApi';

export const unmountFrontComponent: UnmountFrontComponentFunction = () => {
  const unmountFrontComponentFunction =
    frontComponentHostCommunicationApi.unmountFrontComponent;

  if (!isDefined(unmountFrontComponentFunction)) {
    throw new Error('unmountFrontComponentFunction is not set');
  }

  return unmountFrontComponentFunction();
};
