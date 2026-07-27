import { isNonEmptyString } from '@sniptt/guards';

import { SLACK_MARKDOWN_FORMAT_ERROR_CODES } from 'src/logic-functions/constants/slack-markdown-format-error-codes';
import { getSlackApiErrorCode } from 'src/logic-functions/utils/get-slack-api-error-code.util';

export const isSlackMarkdownFormatError = (error: unknown): boolean => {
  const errorCode = getSlackApiErrorCode(error);

  return (
    isNonEmptyString(errorCode) &&
    SLACK_MARKDOWN_FORMAT_ERROR_CODES.has(errorCode)
  );
};
