import { isDefined } from 'twenty-shared/utils';

import {
  frontComponentHostCommunicationApi,
  type OpenCommandConfirmationModalFunction,
} from '../globals/frontComponentHostCommunicationApi';

export const openCommandConfirmationModal: OpenCommandConfirmationModalFunction =
  (params) => {
    const openCommandConfirmationModalFunction =
      frontComponentHostCommunicationApi.openCommandConfirmationModal;

    if (!isDefined(openCommandConfirmationModalFunction)) {
      throw new Error('openCommandConfirmationModalFunction is not set');
    }

    return openCommandConfirmationModalFunction(params);
  };
