import { isBoolean, isNonEmptyString, isString } from '@sniptt/guards';

import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';

export const parseSlackToolResult = ({
  value,
  fallbackMessage,
}: {
  value: unknown;
  fallbackMessage: string;
}): SlackToolResult => {
  const record = asRecord(value);

  if (record === undefined || !isBoolean(record.success)) {
    return {
      success: false,
      message: fallbackMessage,
      error: 'The request failed. Please try again.',
    };
  }

  return {
    success: record.success,
    // A missing message would render an empty snackbar; fall back instead.
    message: isNonEmptyString(record.message)
      ? record.message
      : fallbackMessage,
    error: isString(record.error) ? record.error : undefined,
  };
};
