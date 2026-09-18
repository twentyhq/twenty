import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { createSlackUserLink } from 'src/logic-functions/data/create-slack-user-link';
import { updateSlackUserLink } from 'src/logic-functions/data/update-slack-user-link';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { type SlackUserLinkSummary } from 'src/logic-functions/types/slack-user-link-summary.type';
import { resolveSlackIdentities } from 'src/logic-functions/utils/resolve-slack-identities';

const recordEmailMatchOnAutoLink = async ({
  link,
  slackUserId,
  slackTeamId,
  displayName,
  workspaceMemberId,
}: {
  link: SlackUserLinkSummary | undefined;
  slackUserId: string;
  slackTeamId: string;
  displayName: string | undefined;
  workspaceMemberId: string;
}): Promise<void> => {
  if (link?.source === SLACK_USER_LINK_SOURCE.MANUAL) {
    return;
  }

  const applicationClient = new CoreApiClient({ runAs: 'application' });

  if (!isDefined(link)) {
    await createSlackUserLink(applicationClient, {
      slackTeamId,
      slackUserId,
      workspaceMemberId,
      name: displayName ?? slackUserId,
      source: SLACK_USER_LINK_SOURCE.AUTO,
      consentState: SLACK_USER_LINK_CONSENT_STATE.ACTIVE,
    }).catch(() => undefined);

    return;
  }

  if (link.workspaceMemberId !== workspaceMemberId) {
    await updateSlackUserLink(applicationClient, {
      id: link.id,
      workspaceMemberId,
    }).catch(() => undefined);
  }
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

  const { slackUserId, slackTeamId, displayName } = identity;

  const resolutionBySlackUserId = await resolveSlackIdentities({
    slackUserIds: [slackUserId],
    knownIdentities: [identity],
    client,
    slackClient,
  }).catch(() => undefined);

  const resolution = resolutionBySlackUserId?.get(slackUserId);

  if (!isDefined(resolution) || resolution.outcome !== 'confirmedMember') {
    return undefined;
  }

  const { workspaceMemberId, memberProvenance } = resolution;

  if (memberProvenance === 'verifiedEmail') {
    await recordEmailMatchOnAutoLink({
      link: resolution.link,
      slackUserId,
      slackTeamId,
      displayName,
      workspaceMemberId,
    });
  }

  return workspaceMemberId;
};
