import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { createSlackUserLink } from 'src/logic-functions/data/create-slack-user-link';
import { findSlackUserLinkWorkspaceMemberId } from 'src/logic-functions/data/find-slack-user-link';
import { findWorkspaceMemberIdByEmail } from 'src/logic-functions/data/find-workspace-member-id-by-email';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';

// Auto-linking trusts an email, and an email is only as good as whoever vouched
// for it. Within the Slack workspace that installed the app that is this
// workspace's own admin; for a Slack Connect user it is a different
// organisation's. The installing team is read from the live connection rather
// than cached, so a reconnected or replaced connection cannot leave a stale team
// standing in as the authority.
const resolveLinkableEmail = async ({
  slackClient,
  identity,
}: {
  slackClient: WebClient;
  identity: SlackUserIdentity;
}): Promise<string | undefined> => {
  if (!identity.isRegularUserAccount || !isNonEmptyString(identity.email)) {
    return undefined;
  }

  const authResult = await slackClient.auth.test().catch(() => undefined);
  const installedTeamId = authResult?.team_id;

  if (
    !isNonEmptyString(installedTeamId) ||
    identity.slackTeamId !== installedTeamId
  ) {
    return undefined;
  }

  return identity.email;
};

// Resolving to nothing is not a failure: the assistant then runs with its own
// role, which is what every install did before links existed.
export const resolveSlackRunAsWorkspaceMemberId = async ({
  client,
  slackClient,
  identity,
}: {
  client: CoreApiClient;
  slackClient: WebClient;
  identity: SlackUserIdentity | undefined;
}): Promise<string | undefined> => {
  if (!isDefined(identity) || !isNonEmptyString(identity.slackTeamId)) {
    return undefined;
  }

  const { slackUserId, slackTeamId } = identity;

  const existingWorkspaceMemberId = await findSlackUserLinkWorkspaceMemberId(
    client,
    { slackTeamId, slackUserId },
  ).catch(() => undefined);

  if (isNonEmptyString(existingWorkspaceMemberId)) {
    return existingWorkspaceMemberId;
  }

  const linkableEmail = await resolveLinkableEmail({ slackClient, identity });

  if (!isNonEmptyString(linkableEmail)) {
    return undefined;
  }

  const workspaceMemberId = await findWorkspaceMemberIdByEmail(
    client,
    linkableEmail,
  ).catch(() => undefined);

  if (!isNonEmptyString(workspaceMemberId)) {
    return undefined;
  }

  try {
    await createSlackUserLink(client, {
      slackTeamId,
      slackUserId,
      workspaceMemberId,
      name: identity.displayName ?? slackUserId,
    });
  } catch {
    // A concurrent request may have won the unique index on team + user. Its
    // link is authoritative, so read it back rather than assuming ours.
    return await findSlackUserLinkWorkspaceMemberId(client, {
      slackTeamId,
      slackUserId,
    }).catch(() => undefined);
  }

  return workspaceMemberId;
};
