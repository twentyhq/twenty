import { DEFAULT_RECALL_RECORDING_BOT_ENABLED } from 'src/logic-functions/constants/default-recall-recording-bot-enabled';
import { RECALL_RECORDING_BOT_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-recording-bot-enabled-env-var-name';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const isRecallRecordingBotEnabled = (
  rawEnabled = process.env[RECALL_RECORDING_BOT_ENABLED_ENV_VAR_NAME],
): boolean => {
  if (!isNonEmptyString(rawEnabled)) {
    return DEFAULT_RECALL_RECORDING_BOT_ENABLED;
  }

  const normalizedEnabled = rawEnabled.trim().toLowerCase();

  return !['false', '0', 'off', 'no'].includes(normalizedEnabled);
};
