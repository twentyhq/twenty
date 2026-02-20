import { isDefined } from 'twenty-shared/utils';

import {
  frontComponentHostCommunicationApi,
  type UnmountFrontComponentFunction,
} from '../globals/frontComponentHostCommunicationApi';

export const setUnmountFrontComponent = (
  fn: UnmountFrontComponentFunction,
): void => {
  frontComponentHostCommunicationApi.unmountFrontComponent = fn;
};

export const unmountFrontComponent: UnmountFrontComponentFunction =
  (): Promise<void> => {
    const unmountFrontComponentFunction =
      frontComponentHostCommunicationApi.unmountFrontComponent;

    if (!isDefined(unmountFrontComponentFunction)) {
      throw new Error('unmountFrontComponentFunction is not set');
    }

    return unmountFrontComponentFunction();
  };
