import { isDefined } from 'twenty-shared/utils';

import {
  frontComponentHostCommunicationApi,
  type OpenActionConfirmationModalFunction,
} from '../globals/frontComponentHostCommunicationApi';

export const openActionConfirmationModal: OpenActionConfirmationModalFunction =
  (params) => {
    const openActionConfirmationModalFunction =
      frontComponentHostCommunicationApi.openActionConfirmationModal;

    if (!isDefined(openActionConfirmationModalFunction)) {
      throw new Error('openActionConfirmationModalFunction is not set');
    }

    return openActionConfirmationModalFunction(params);
  };
