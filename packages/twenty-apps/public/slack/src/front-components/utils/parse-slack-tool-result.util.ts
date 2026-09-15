import { isBoolean, isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

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

  if (!isDefined(record) || !isBoolean(record.success)) {
    return {
      success: false,
      message: fallbackMessage,
      error: 'The request failed. Please try again.',
    };
  }

  return {
    success: record.success,
    message: isNonEmptyString(record.message)
      ? record.message
      : fallbackMessage,
    error: isString(record.error) ? record.error : undefined,
  };
};
