import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { createSlackUserMapping } from 'src/logic-functions/data/create-slack-user-mapping';
import { findSlackUserMappingWorkspaceMemberId } from 'src/logic-functions/data/find-slack-user-mapping';
import { findWorkspaceMemberIdByEmail } from 'src/logic-functions/data/find-workspace-member-id-by-email';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';

// Resolving to nothing is not a failure: the assistant then runs with its own
// role, which is what every install did before mappings existed.
export const resolveSlackRunAsWorkspaceMemberId = async ({
  client,
  identity,
}: {
  client: CoreApiClient;
  identity: SlackUserIdentity | undefined;
}): Promise<string | undefined> => {
  if (identity === undefined || !isNonEmptyString(identity.slackTeamId)) {
    return undefined;
  }

  const { slackUserId, slackTeamId } = identity;

  const existingWorkspaceMemberId = await findSlackUserMappingWorkspaceMemberId(
    client,
    { slackTeamId, slackUserId },
  ).catch(() => undefined);

  if (isNonEmptyString(existingWorkspaceMemberId)) {
    return existingWorkspaceMemberId;
  }

  if (!identity.canBeMatchedOnEmail || !isNonEmptyString(identity.email)) {
    return undefined;
  }

  const workspaceMemberId = await findWorkspaceMemberIdByEmail(
    client,
    identity.email,
  ).catch(() => undefined);

  if (!isNonEmptyString(workspaceMemberId)) {
    return undefined;
  }

  try {
    await createSlackUserMapping(client, {
      slackTeamId,
      slackUserId,
      workspaceMemberId,
      name: identity.displayName ?? slackUserId,
    });
  } catch {
    // A concurrent request may have won the unique index on team + user. Its
    // mapping is authoritative, so read it back rather than assuming ours.
    return await findSlackUserMappingWorkspaceMemberId(client, {
      slackTeamId,
      slackUserId,
    }).catch(() => undefined);
  }

  return workspaceMemberId;
};
