import { DEFAULT_RECALL_RECORDING_BOT_ENABLED } from 'src/logic-functions/constants/default-recall-recording-bot-enabled';
import { RECALL_RECORDING_BOT_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-recording-bot-enabled-env-var-name';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const DISABLED_VALUES = ['false', '0', 'off', 'no'];

export const getRecallRecordingBotEnabled = (): boolean => {
  const rawEnabled = getApplicationVariableValue(
    RECALL_RECORDING_BOT_ENABLED_ENV_VAR_NAME,
  );

  if (!isNonEmptyString(rawEnabled)) {
    return DEFAULT_RECALL_RECORDING_BOT_ENABLED;
  }

  return !DISABLED_VALUES.includes(rawEnabled.trim().toLowerCase());
};
