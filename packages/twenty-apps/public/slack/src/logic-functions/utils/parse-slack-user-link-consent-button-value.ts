import { isNonEmptyString, isObject } from '@sniptt/guards';

import { SLACK_USER_LINK_CONSENT_DECISION } from 'src/logic-functions/constants/slack-user-link-consent-decision';
import { type SlackUserLinkConsentButtonValue } from 'src/logic-functions/types/slack-user-link-consent-button-value.type';

const isConsentDecision = (
  value: unknown,
): value is SlackUserLinkConsentButtonValue['decision'] =>
  value === SLACK_USER_LINK_CONSENT_DECISION.APPROVE ||
  value === SLACK_USER_LINK_CONSENT_DECISION.DECLINE;

export const parseSlackUserLinkConsentButtonValue = (
  value: string | undefined,
): SlackUserLinkConsentButtonValue | undefined => {
  if (!isNonEmptyString(value)) {
    return undefined;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    return undefined;
  }

  if (!isObject<Record<string, unknown>, unknown>(parsed)) {
    return undefined;
  }

  const { decision, slackTeamId, slackUserId, workspaceMemberId } = parsed;

  if (
    !isConsentDecision(decision) ||
    !isNonEmptyString(slackTeamId) ||
    !isNonEmptyString(slackUserId) ||
    !isNonEmptyString(workspaceMemberId)
  ) {
    return undefined;
  }

  return { decision, slackTeamId, slackUserId, workspaceMemberId };
};
