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
import { type SlackUserLink } from 'src/logic-functions/types/slack-user-link.type';

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

  let existingLink: SlackUserLink | undefined;

  try {
    existingLink = await findSlackUserLink(client, { slackTeamId, slackUserId });
  } catch {
    return undefined;
  }

  const isManualLink =
    existingLink?.source === SLACK_USER_LINK_SOURCE.MANUAL;

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
    await createSlackUserLink(client, {
      slackTeamId,
      slackUserId,
      workspaceMemberId,
      name: identity.displayName ?? slackUserId,
    }).catch(() => undefined);

    return workspaceMemberId;
  }

  if (!isManualLink && existingLink.workspaceMemberId !== workspaceMemberId) {
    await updateSlackUserLink(client, {
      id: existingLink.id,
      workspaceMemberId,
    }).catch(() => undefined);
  }

  return workspaceMemberId;
};
