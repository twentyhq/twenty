import { isNonEmptyString } from '@sniptt/guards';

import { SLACK_ASSISTANT_FAILURE_TEXT } from 'src/logic-functions/constants/slack-assistant-failure-text';

export const buildSlackAssistantUserFacingErrorMessage = (
  error: string | null | undefined,
): string => {
  if (!isNonEmptyString(error)) {
    return SLACK_ASSISTANT_FAILURE_TEXT;
  }

  return `I couldn't complete that.\n\n${error}`;
};
