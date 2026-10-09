import { listConnections } from 'twenty-sdk/logic-function';

import { TEAMS_PROVIDER_NAME } from 'src/features/transcripts/constants/teams-provider-name';

export const isTeamsConnectionListed = async (
  connectedAccountId: string,
): Promise<boolean> =>
  (await listConnections({ providerName: TEAMS_PROVIDER_NAME })).some(
    (connection) => connection.id === connectedAccountId,
  );
