import { type AppConnection } from 'twenty-sdk/logic-function';
import { isDefined } from 'src/utils/is-defined';

export const getConnectionAccessTokenOrThrow = (
  connection: Pick<AppConnection, 'id' | 'accessToken'>,
): string => {
  if (!isDefined(connection.accessToken)) {
    throw new Error(`Connection ${connection.id} has no access token`);
  }

  return connection.accessToken;
};
