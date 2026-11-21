import { isNonEmptyString } from '@sniptt/guards';
import { getConnection } from 'twenty-sdk/logic-function';

export const getLineAccessTokenOrThrow = async (
  connectedAccountId: string,
): Promise<string> => {
  const { accessToken } = await getConnection(connectedAccountId);

  if (!isNonEmptyString(accessToken)) {
    throw new Error(`LINE connection ${connectedAccountId} has no access token`);
  }

  return accessToken;
};
