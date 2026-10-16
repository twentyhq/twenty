import { isNonEmptyString } from '@sniptt/guards';

import { getAppAccessTokenPayload } from 'src/logic-functions/utils/get-app-access-token-payload.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

export const getCurrentApplicationId = (): string => {
  const applicationId = getString(getAppAccessTokenPayload()?.applicationId);

  if (!isNonEmptyString(applicationId)) {
    throw new Error('Application ID unavailable');
  }

  return applicationId;
};
