import { type AppConnection, listConnections } from 'twenty-sdk/logic-function';

import { LINKEDIN_PROVIDER_NAME } from 'src/constants/linkedin-provider-name.constant';

export const findLinkedinConnectionByUnipileAccountId = async (
  unipileAccountId: string,
): Promise<AppConnection | undefined> => {
  const connections = await listConnections({
    providerName: LINKEDIN_PROVIDER_NAME,
  });

  return connections.find(
    (connection) => connection.externalAccountId === unipileAccountId,
  );
};
