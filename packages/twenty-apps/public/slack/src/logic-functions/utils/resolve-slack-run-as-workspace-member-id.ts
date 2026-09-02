import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { createSlackUserLink } from 'src/logic-functions/data/create-slack-user-link';
import { findSlackUserLink } from 'src/logic-functions/data/find-slack-user-link';
import { findWorkspaceMemberIdByEmail } from 'src/logic-functions/data/find-workspace-member-id-by-email';
import { updateSlackUserLink } from 'src/logic-functions/data/update-slack-user-link';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { type SlackUserLink } from 'src/logic-functions/types/slack-user-link.type';
import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';
import { isConsentedSlackUserLink } from 'src/logic-functions/utils/is-consented-slack-user-link';

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

  const installedTeamId = await getInstalledSlackTeamId(slackClient);

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
    existingLink = await findSlackUserLink(client, {
      slackTeamId,
      slackUserId,
    });
  } catch {
    return undefined;
  }

  const isManualLink = existingLink?.source === SLACK_USER_LINK_SOURCE.MANUAL;

  if (isManualLink) {
    if (isConsentedSlackUserLink(existingLink?.consentState)) {
      return isNonEmptyString(existingLink?.workspaceMemberId)
        ? existingLink.workspaceMemberId
        : undefined;
    }
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

  if (isManualLink) {
    return workspaceMemberId;
  }

  const applicationClient = new CoreApiClient({ runAs: 'application' });

  if (!isDefined(existingLink)) {
    await createSlackUserLink(applicationClient, {
      slackTeamId,
      slackUserId,
      workspaceMemberId,
      name: identity.displayName ?? slackUserId,
      source: SLACK_USER_LINK_SOURCE.AUTO,
      consentState: SLACK_USER_LINK_CONSENT_STATE.ACTIVE,
    }).catch(() => undefined);

    return workspaceMemberId;
  }

  if (existingLink.workspaceMemberId !== workspaceMemberId) {
    await updateSlackUserLink(applicationClient, {
      id: existingLink.id,
      workspaceMemberId,
    }).catch(() => undefined);
  }

  return workspaceMemberId;
};
