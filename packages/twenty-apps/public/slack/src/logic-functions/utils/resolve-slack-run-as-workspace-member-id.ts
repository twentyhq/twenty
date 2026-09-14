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
import { type SlackLinkageResolution } from 'src/logic-functions/types/slack-linkage-resolution.type';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { type SlackUserLink } from 'src/logic-functions/types/slack-user-link.type';
import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';
import { isLinkableSlackIdentity } from 'src/logic-functions/utils/is-linkable-slack-identity';
import { isManualConsentedSlackUserLink } from 'src/logic-functions/utils/is-manual-consented-slack-user-link';

const resolveLinkableEmail = async ({
  slackClient,
  identity,
}: {
  slackClient: WebClient;
  identity: SlackUserIdentity;
}): Promise<
  { status: 'RESOLVED'; email: string | undefined } | { status: 'UNVERIFIABLE' }
> => {
  const installedSlackTeamId = await getInstalledSlackTeamId(slackClient);

  // An unreadable installing team is not a mismatched one: without it a guest
  // cannot be told apart from a member, so this must not read as "not linked".
  if (!isNonEmptyString(installedSlackTeamId)) {
    return { status: 'UNVERIFIABLE' };
  }

  return {
    status: 'RESOLVED',
    email: isLinkableSlackIdentity({ identity, installedSlackTeamId })
      ? identity.email
      : undefined,
  };
};

export const resolveSlackLinkage = async ({
  client,
  slackClient,
  identity,
}: {
  client: CoreApiClient;
  slackClient: WebClient;
  identity: SlackUserIdentity | undefined;
}): Promise<SlackLinkageResolution> => {
  if (!isDefined(identity) || !isNonEmptyString(identity.slackTeamId)) {
    return { status: 'UNLINKED' };
  }

  const { slackUserId, slackTeamId } = identity;

  let existingLink: SlackUserLink | undefined;

  try {
    existingLink = await findSlackUserLink(client, {
      slackTeamId,
      slackUserId,
    });
  } catch {
    return { status: 'UNVERIFIABLE' };
  }

  const isManualLink = existingLink?.source === SLACK_USER_LINK_SOURCE.MANUAL;

  if (
    isDefined(existingLink) &&
    isManualConsentedSlackUserLink({
      source: existingLink.source,
      consentState: existingLink.consentState,
    })
  ) {
    return isNonEmptyString(existingLink.workspaceMemberId)
      ? { status: 'LINKED', workspaceMemberId: existingLink.workspaceMemberId }
      : { status: 'UNLINKED' };
  }

  const linkable = await resolveLinkableEmail({ slackClient, identity });

  if (linkable.status === 'UNVERIFIABLE') {
    return { status: 'UNVERIFIABLE' };
  }

  const linkableEmail = linkable.email;

  if (!isNonEmptyString(linkableEmail)) {
    return { status: 'UNLINKED' };
  }

  let workspaceMemberId: string | undefined;

  try {
    workspaceMemberId = await findWorkspaceMemberIdByEmail(
      client,
      linkableEmail,
    );
  } catch {
    return { status: 'UNVERIFIABLE' };
  }

  if (!isNonEmptyString(workspaceMemberId)) {
    return { status: 'UNLINKED' };
  }

  if (isManualLink) {
    return { status: 'LINKED', workspaceMemberId };
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

    return { status: 'LINKED', workspaceMemberId };
  }

  if (existingLink.workspaceMemberId !== workspaceMemberId) {
    await updateSlackUserLink(applicationClient, {
      id: existingLink.id,
      workspaceMemberId,
    }).catch(() => undefined);
  }

  return { status: 'LINKED', workspaceMemberId };
};

export const resolveSlackRunAsWorkspaceMemberId = async (parameters: {
  client: CoreApiClient;
  slackClient: WebClient;
  identity: SlackUserIdentity | undefined;
}): Promise<string | undefined> => {
  const resolution = await resolveSlackLinkage(parameters);

  return resolution.status === 'LINKED'
    ? resolution.workspaceMemberId
    : undefined;
};
