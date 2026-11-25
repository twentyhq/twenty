import { listTeamsConnections } from 'src/features/transcripts/logic-functions/utils/list-teams-connections';

export const isTeamsConnectionListed = async (
  connectedAccountId: string,
): Promise<boolean> =>
  (await listTeamsConnections()).some(
    (connection) => connection.id === connectedAccountId,
  );
