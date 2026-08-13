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
  // The claim can move between routing and this run: the original workspace
  // disconnects and another one claims the same team. Only delete while the
  // claim still points at the workspace the event was routed to, so a stale
  // removal cannot evict the new holder's claim.
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
  // Freeing the team claim is the point of this function, and the claim can
  // outlive its connections, so release it first and by team id rather than
  // through the connections.
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
          // Best-effort: a stale per-connection entry only affects the
          // disconnect path of a connection that is already dead.
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
