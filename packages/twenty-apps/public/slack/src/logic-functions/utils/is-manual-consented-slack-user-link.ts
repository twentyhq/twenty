import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { type SlackUserLinkSummary } from 'src/logic-functions/types/slack-user-link-summary.type';
import { isConsentedSlackUserLink } from 'src/logic-functions/utils/is-consented-slack-user-link';

// The only shape whose stored workspace member is trusted without checking it
// against the account's live verified email: a person picked it by hand and the
// Slack user consented to it. A consented link that names nobody still settles
// the question, so callers stop rather than falling back to an email match.
export const isManualConsentedSlackUserLink = (
  link: Pick<SlackUserLinkSummary, 'source' | 'consentState'>,
): boolean =>
  link.source === SLACK_USER_LINK_SOURCE.MANUAL &&
  isConsentedSlackUserLink(link.consentState);
