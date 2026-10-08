import { CustomError, isDefined } from 'twenty-shared/utils';

import {
  type UpdateUserApplicationVariableFunction,
  frontComponentHostCommunicationApi,
} from '../globals/frontComponentHostCommunicationApi';

export const updateUserApplicationVariable: UpdateUserApplicationVariableFunction =
  async (params) => {
    const updateUserApplicationVariableFunction =
      frontComponentHostCommunicationApi.updateUserApplicationVariable;

    if (!isDefined(updateUserApplicationVariableFunction)) {
      throw new CustomError(
        'User application variables are only available in personal app settings',
        'FRONT_COMPONENT_USER_PREFERENCES_UNAVAILABLE',
      );
    }

    return updateUserApplicationVariableFunction(params);
  };
