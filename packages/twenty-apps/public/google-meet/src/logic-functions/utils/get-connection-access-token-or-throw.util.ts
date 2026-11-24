import { type AppConnection } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GoogleMeetException } from 'src/logic-functions/types/google-meet-exception.type';

export const getConnectionAccessTokenOrThrow = ({
  id,
  accessToken,
}: Pick<AppConnection, 'id' | 'accessToken'>): string => {
  if (!isDefined(accessToken)) {
    throw new GoogleMeetException({
      message: `Connection ${id} has no access token`,
      code: 'CONNECTION_WITHOUT_ACCESS_TOKEN',
    });
  }

  return accessToken;
};
