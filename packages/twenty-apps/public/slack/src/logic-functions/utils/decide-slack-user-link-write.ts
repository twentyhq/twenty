import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { findWorkspaceMemberEmailById } from 'src/logic-functions/data/find-workspace-member-email-by-id';
import { type SlackUserLinkConsentState } from 'src/logic-functions/types/slack-user-link-consent-state.type';
import { type SlackUserLinkSource } from 'src/logic-functions/types/slack-user-link-source.type';
import { fetchSlackUserIdentity } from 'src/logic-functions/utils/fetch-slack-user-identity';

type SlackUserLinkWriteDecision = {
  isEagerAutoMatch: boolean;
  requiresConsent: boolean;
  consentState: SlackUserLinkConsentState | undefined;
  source: SlackUserLinkSource | undefined;
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
  slackClient,
  slackUserId,
  workspaceMemberId,
  slackUserEmail,
  isInInstalledWorkspace,
  isSameMemberRelink,
}: {
  client: CoreApiClient;
  slackClient: WebClient;
  slackUserId: string;
  workspaceMemberId: string;
  slackUserEmail: string | undefined;
  isInInstalledWorkspace: boolean;
  isSameMemberRelink: boolean;
}): Promise<SlackUserLinkWriteDecision> => {
  const shouldCheckEmailMatch = isInInstalledWorkspace && !isSameMemberRelink;

  // The settings form submits the resolved Slack id and team rather than the
  // email it started from, so no verified email reaches the handler on that
  // path; only Slack's own profile email for the id can certify a match that
  // skips consent, so ask Slack when the caller could not.
  const resolveVerifiedEmail = async (): Promise<string | undefined> => {
    if (!shouldCheckEmailMatch) {
      return undefined;
    }

    if (isNonEmptyString(slackUserEmail)) {
      return slackUserEmail;
    }

    const identity = await fetchSlackUserIdentity({
      client: slackClient,
      slackUserId,
    });

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

  // A same-member re-save rewrites neither consent state nor source: it
  // changes nothing about the mapping, so the stored state stands.
  const consentState = isSameMemberRelink
    ? undefined
    : !isInInstalledWorkspace
      ? SLACK_USER_LINK_CONSENT_STATE.ADMIN_SET
      : isEagerAutoMatch
        ? SLACK_USER_LINK_CONSENT_STATE.ACTIVE
        : SLACK_USER_LINK_CONSENT_STATE.PENDING;

  // A same-member re-save must not rewrite the source: forcing MANUAL would
  // pin an AUTO link, silently trading its live email re-verification for a
  // static grant the person may never have consented to.
  const source = isSameMemberRelink
    ? undefined
    : isEagerAutoMatch
      ? SLACK_USER_LINK_SOURCE.AUTO
      : SLACK_USER_LINK_SOURCE.MANUAL;

  return { isEagerAutoMatch, requiresConsent, consentState, source };
};
