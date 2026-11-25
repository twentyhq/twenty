import { type AppConnection } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { MeetException } from 'src/logic-functions/types/meet-exception.type';

export const getConnectionAccessTokenOrThrow = ({
  id,
  accessToken,
}: Pick<AppConnection, 'id' | 'accessToken'>): string => {
  if (!isDefined(accessToken)) {
    throw new MeetException({
      message: `Connection ${id} has no access token`,
      code: 'CONNECTION_WITHOUT_ACCESS_TOKEN',
    });
  }

  return accessToken;
};
