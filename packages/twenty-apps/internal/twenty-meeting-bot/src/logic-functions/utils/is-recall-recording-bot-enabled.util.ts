import { DEFAULT_RECALL_RECORDING_BOT_ENABLED } from 'src/logic-functions/constants/default-recall-recording-bot-enabled';
import { RECALL_RECORDING_BOT_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-recording-bot-enabled-env-var-name';

export const isRecallRecordingBotEnabled = (
  rawEnabled = process.env[RECALL_RECORDING_BOT_ENABLED_ENV_VAR_NAME],
): boolean => {
  if (rawEnabled === undefined || rawEnabled.trim() === '') {
    return DEFAULT_RECALL_RECORDING_BOT_ENABLED;
  }

  const normalizedEnabled = rawEnabled.trim().toLowerCase();

  return !['false', '0', 'off', 'no'].includes(normalizedEnabled);
};
