import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { findWorkspaceMemberEmailById } from 'src/logic-functions/data/find-workspace-member-email-by-id';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { type SlackUserLinkConsentState } from 'src/logic-functions/types/slack-user-link-consent-state.type';
import { type SlackUserLinkSource } from 'src/logic-functions/types/slack-user-link-source.type';
import { fetchSlackUserIdentity } from 'src/logic-functions/utils/fetch-slack-user-identity';

type SlackUserLinkWriteDecision = {
  isEagerAutoMatch: boolean;
  requiresConsent: boolean;
  consentState: SlackUserLinkConsentState | undefined;
  source: SlackUserLinkSource | undefined;
};

export const decideSlackUserLinkWrite = async ({
  client,
  slackClient,
  slackUserId,
  workspaceMemberId,
  fetchedIdentity,
  isInInstalledWorkspace,
  isSameMemberRelink,
}: {
  client: CoreApiClient;
  slackClient: WebClient;
  slackUserId: string;
  workspaceMemberId: string;
  fetchedIdentity: SlackUserIdentity | undefined;
  isInInstalledWorkspace: boolean;
  isSameMemberRelink: boolean;
}): Promise<SlackUserLinkWriteDecision> => {
  const shouldCheckEmailMatch = isInInstalledWorkspace && !isSameMemberRelink;

  const resolveVerifiedEmail = async (): Promise<string | undefined> => {
    if (!shouldCheckEmailMatch) {
      return undefined;
    }

    const identity =
      fetchedIdentity ??
      (await fetchSlackUserIdentity({ client: slackClient, slackUserId }));

    return identity?.isRegularUserAccount ? identity.email : undefined;
  };

  const verifiedEmail = await resolveVerifiedEmail();

  const memberEmail = isNonEmptyString(verifiedEmail)
    ? await findWorkspaceMemberEmailById(client, workspaceMemberId)
    : undefined;

  const isEagerAutoMatch =
    isNonEmptyString(verifiedEmail) &&
    isNonEmptyString(memberEmail) &&
    verifiedEmail.toLowerCase() === memberEmail.toLowerCase();

  const requiresConsent =
    isInInstalledWorkspace && !isSameMemberRelink && !isEagerAutoMatch;

  if (isSameMemberRelink) {
    return {
      isEagerAutoMatch,
      requiresConsent,
      consentState: undefined,
      source: undefined,
    };
  }

  const consentState = !isInInstalledWorkspace
    ? SLACK_USER_LINK_CONSENT_STATE.ADMIN_SET
    : isEagerAutoMatch
      ? SLACK_USER_LINK_CONSENT_STATE.ACTIVE
      : SLACK_USER_LINK_CONSENT_STATE.PENDING;

  const source = isEagerAutoMatch
    ? SLACK_USER_LINK_SOURCE.AUTO
    : SLACK_USER_LINK_SOURCE.MANUAL;

  return { isEagerAutoMatch, requiresConsent, consentState, source };
};
