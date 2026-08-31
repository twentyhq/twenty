import { isNonEmptyString } from '@sniptt/guards';

import { type SlackResolveInput } from 'src/front-components/utils/to-slack-resolve-input.util';

const SLACK_USER_ID_PATTERN = /^[UW][A-Z0-9]{7,}$/i;

export const isResolvableSlackIdentity = ({
  slackUserId,
}: SlackResolveInput): boolean =>
  isNonEmptyString(slackUserId) && SLACK_USER_ID_PATTERN.test(slackUserId);
