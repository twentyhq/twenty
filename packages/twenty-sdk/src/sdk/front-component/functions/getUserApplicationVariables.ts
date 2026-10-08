import { CustomError, isDefined } from 'twenty-shared/utils';

import {
  type GetUserApplicationVariablesFunction,
  frontComponentHostCommunicationApi,
} from '../globals/frontComponentHostCommunicationApi';

export const getUserApplicationVariables: GetUserApplicationVariablesFunction =
  async () => {
    const getUserApplicationVariablesFunction =
      frontComponentHostCommunicationApi.getUserApplicationVariables;

    if (!isDefined(getUserApplicationVariablesFunction)) {
      throw new CustomError(
        'User application variables are only available in personal app settings',
        'FRONT_COMPONENT_USER_PREFERENCES_UNAVAILABLE',
      );
    }

    return getUserApplicationVariablesFunction();
  };
