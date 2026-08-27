import { isNonEmptyString } from '@sniptt/guards';

import { type SlackResolveInput } from 'src/front-components/utils/to-slack-resolve-input.util';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Slack mints user ids as U or W followed by at least seven alphanumerics.
const SLACK_USER_ID_PATTERN = /^[UW][A-Z0-9]{7,}$/i;

// Auto-resolve fires while the admin is still typing, so only an identity
// that is plausibly complete is worth a lookup. A Slack user id takes
// precedence over the email, matching the resolve handler.
export const isResolvableSlackIdentity = ({
  email,
  slackUserId,
}: SlackResolveInput): boolean => {
  if (isNonEmptyString(slackUserId)) {
    return SLACK_USER_ID_PATTERN.test(slackUserId);
  }

  return isNonEmptyString(email) && EMAIL_PATTERN.test(email);
};
