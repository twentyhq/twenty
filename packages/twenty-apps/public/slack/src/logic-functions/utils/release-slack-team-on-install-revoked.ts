import { isNonEmptyString } from '@sniptt/guards';
import { kv, listConnections } from 'twenty-sdk/logic-function';

import { getSlackConnectedAccountTeam } from 'src/logic-functions/utils/get-slack-connected-account-team';
import { getSlackConnectedAccountTeamKvKey } from 'src/logic-functions/utils/get-slack-connected-account-team-kv-key';
import { getSlackTeamKvKey } from 'src/logic-functions/utils/get-slack-team-kv-key';
import { findClaimedWorkspaceId } from 'src/logic-functions/utils/resolve-target-workspace-id';

type ReleaseSlackTeamOnInstallRevokedArgs = {
  teamId: string;
  claimedWorkspaceId: string | undefined;
};

type ReleaseSlackTeamOnInstallRevokedResult = {
  ok: true;
  releasedTeamId: string | null;
  releasedConnectedAccountIds: string[];
};

const releaseSlackTeamClaimIfStillOurs = async ({
  teamId,
  claimedWorkspaceId,
}: ReleaseSlackTeamOnInstallRevokedArgs): Promise<boolean> => {
  const currentClaimHolder = await findClaimedWorkspaceId(teamId);

  const isClaimHeldByAnotherWorkspace =
    isNonEmptyString(currentClaimHolder) &&
    isNonEmptyString(claimedWorkspaceId) &&
    currentClaimHolder !== claimedWorkspaceId;

  if (isClaimHeldByAnotherWorkspace) {
    return false;
  }

  return kv.delete(getSlackTeamKvKey(teamId), { scope: 'SERVER' });
};

export const releaseSlackTeamOnInstallRevoked = async ({
  teamId,
  claimedWorkspaceId,
}: ReleaseSlackTeamOnInstallRevokedArgs): Promise<ReleaseSlackTeamOnInstallRevokedResult> => {
  const hasReleasedTeam = await releaseSlackTeamClaimIfStillOurs({
    teamId,
    claimedWorkspaceId,
  });

  const connections = await listConnections({ providerName: 'slack' });

  const releasedConnectedAccountIds = (
    await Promise.all(
      connections.map(async (connection) => {
        try {
          const connectionTeamId = await getSlackConnectedAccountTeam(
            connection.id,
          );

          if (connectionTeamId !== teamId) {
            return null;
          }

          await kv.delete(getSlackConnectedAccountTeamKvKey(connection.id));

          return connection.id;
        } catch {
          return null;
        }
      }),
    )
  ).filter((connectedAccountId): connectedAccountId is string =>
    isNonEmptyString(connectedAccountId),
  );

  return {
    ok: true,
    releasedTeamId: hasReleasedTeam ? teamId : null,
    releasedConnectedAccountIds,
  };
};
