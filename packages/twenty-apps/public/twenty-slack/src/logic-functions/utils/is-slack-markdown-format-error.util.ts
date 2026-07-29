import { isNonEmptyString } from '@sniptt/guards';

import { getSlackApiErrorCode } from 'src/logic-functions/utils/get-slack-api-error-code.util';

const SLACK_MARKDOWN_FORMAT_ERROR_CODES = new Set([
  'invalid_arguments',
  'invalid_blocks',
]);

export const isSlackMarkdownFormatError = (error: unknown): boolean => {
  const errorCode = getSlackApiErrorCode(error);

  return (
    isNonEmptyString(errorCode) &&
    SLACK_MARKDOWN_FORMAT_ERROR_CODES.has(errorCode)
  );
};
