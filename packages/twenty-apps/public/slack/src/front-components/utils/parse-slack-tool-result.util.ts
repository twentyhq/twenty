import { isBoolean, isString } from '@sniptt/guards';

import { asRecord } from 'src/front-components/utils/as-record.util';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';

export const parseSlackToolResult = (
  value: unknown,
  fallbackMessage: string,
): SlackToolResult => {
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
    message: isString(record.message) ? record.message : '',
    error: isString(record.error) ? record.error : undefined,
  };
};
