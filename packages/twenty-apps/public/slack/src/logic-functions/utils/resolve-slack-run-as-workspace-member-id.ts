import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { createSlackUserLink } from 'src/logic-functions/data/create-slack-user-link';
import { findSlackUserLink } from 'src/logic-functions/data/find-slack-user-link';
import { findWorkspaceMemberIdByEmail } from 'src/logic-functions/data/find-workspace-member-id-by-email';
import { updateSlackUserLink } from 'src/logic-functions/data/update-slack-user-link';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';

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

  const existingLink = await findSlackUserLink(client, {
    slackTeamId,
    slackUserId,
  }).catch(() => undefined);

  if (existingLink?.source === SLACK_USER_LINK_SOURCE.MANUAL) {
    return isNonEmptyString(existingLink.workspaceMemberId)
      ? existingLink.workspaceMemberId
      : undefined;
  }

  // A stored email match is never trusted as-is: link records are ordinary
  // records, so the match is recomputed from the live Slack profile on every
  // run and a stale or tampered link cannot borrow permissions the email no
  // longer proves.
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

  if (!isDefined(existingLink)) {
    // Two concurrent first-mentions race on the unique index; the loser still
    // acts on its own recomputed match, which both derived the same way.
    await createSlackUserLink(client, {
      slackTeamId,
      slackUserId,
      workspaceMemberId,
      name: identity.displayName ?? slackUserId,
    }).catch(() => undefined);

    return workspaceMemberId;
  }

  if (existingLink.workspaceMemberId !== workspaceMemberId) {
    await updateSlackUserLink(client, {
      id: existingLink.id,
      workspaceMemberId,
    }).catch(() => undefined);
  }

  return workspaceMemberId;
};
