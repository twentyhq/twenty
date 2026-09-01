import { isNumber } from '@sniptt/guards';

import { parseSlackToolResult } from 'src/front-components/utils/parse-slack-tool-result.util';
import { asRecord } from 'src/logic-functions/utils/as-record.util';

export type SlackRosterMatchOutcome = {
  success: boolean;
  message: string;
  error?: string;
  linkedCount: number;
  unmatchedCount: number;
};

export const parseSlackRosterMatchResult = ({
  value,
  fallbackMessage,
}: {
  value: unknown;
  fallbackMessage: string;
}): SlackRosterMatchOutcome => {
  const base = parseSlackToolResult({ value, fallbackMessage });
  const record = asRecord(value);

  return {
    ...base,
    linkedCount: isNumber(record?.linkedCount) ? record.linkedCount : 0,
    unmatchedCount: isNumber(record?.unmatchedCount)
      ? record.unmatchedCount
      : 0,
  };
};
