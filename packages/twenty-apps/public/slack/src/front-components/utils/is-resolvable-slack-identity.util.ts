import { isNonEmptyString } from '@sniptt/guards';

import { type SlackResolveInput } from 'src/front-components/utils/to-slack-resolve-input.util';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLACK_USER_ID_PATTERN = /^[UW][A-Z0-9]{7,}$/i;

export const isResolvableSlackIdentity = ({
  email,
  slackUserId,
}: SlackResolveInput): boolean => {
  if (isNonEmptyString(slackUserId)) {
    return SLACK_USER_ID_PATTERN.test(slackUserId);
  }

  return isNonEmptyString(email) && EMAIL_PATTERN.test(email);
};
