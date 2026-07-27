import { RECALL_BOT_DETECTION_DEFAULT_NAME_MATCHES } from 'src/logic-functions/constants/recall-bot-detection-name-matches';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const getCallRecorderBotDetectionNameMatches = (
  botName?: string,
): string[] => [
  ...(isNonEmptyString(botName) ? [botName.trim()] : []),
  ...RECALL_BOT_DETECTION_DEFAULT_NAME_MATCHES,
];
