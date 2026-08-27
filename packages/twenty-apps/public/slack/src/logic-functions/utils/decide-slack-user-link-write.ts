import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { findWorkspaceMemberEmailById } from 'src/logic-functions/data/find-workspace-member-email-by-id';
import { type SlackUserLinkConsentState } from 'src/logic-functions/types/slack-user-link-consent-state.type';
import { type SlackUserLinkSource } from 'src/logic-functions/types/slack-user-link-source.type';

type SlackUserLinkWriteDecision = {
  isEagerAutoMatch: boolean;
  requiresConsent: boolean;
  consentState: SlackUserLinkConsentState | undefined;
  source: SlackUserLinkSource;
};

// Linking a Slack account to the member with the same email is the email
// auto-match created eagerly, before the person's first message, so it needs
// no consent handshake. Storing it as an AUTO link keeps it exactly as safe
// as a lazily matched one: the run-as resolver never trusts a stored AUTO
// link and re-verifies the live Slack email on every request. The relink
// guard keeps an explicit decline from being overwritten into an AUTO link
// the resolver would bypass.
export const decideSlackUserLinkWrite = async ({
  client,
  workspaceMemberId,
  slackUserEmail,
  isInInstalledWorkspace,
  isSameMemberRelink,
}: {
  client: CoreApiClient;
  workspaceMemberId: string;
  slackUserEmail: string | undefined;
  isInInstalledWorkspace: boolean;
  isSameMemberRelink: boolean;
}): Promise<SlackUserLinkWriteDecision> => {
  const memberEmail =
    isInInstalledWorkspace &&
    !isSameMemberRelink &&
    isNonEmptyString(slackUserEmail)
      ? await findWorkspaceMemberEmailById(client, workspaceMemberId)
      : undefined;

  const isEagerAutoMatch =
    isNonEmptyString(slackUserEmail) &&
    isNonEmptyString(memberEmail) &&
    slackUserEmail.toLowerCase() === memberEmail.toLowerCase();

  const requiresConsent =
    isInInstalledWorkspace && !isSameMemberRelink && !isEagerAutoMatch;

  const consentState = !isInInstalledWorkspace
    ? SLACK_USER_LINK_CONSENT_STATE.ADMIN_SET
    : isSameMemberRelink
      ? undefined
      : isEagerAutoMatch
        ? SLACK_USER_LINK_CONSENT_STATE.ACTIVE
        : SLACK_USER_LINK_CONSENT_STATE.PENDING;

  const source = isEagerAutoMatch
    ? SLACK_USER_LINK_SOURCE.AUTO
    : SLACK_USER_LINK_SOURCE.MANUAL;

  return { isEagerAutoMatch, requiresConsent, consentState, source };
};
