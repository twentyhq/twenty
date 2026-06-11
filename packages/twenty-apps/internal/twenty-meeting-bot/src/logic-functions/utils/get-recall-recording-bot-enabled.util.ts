import { isRecallRecordingBotEnabled } from 'src/logic-functions/constants/is-recall-recording-bot-enabled';
import { RECALL_RECORDING_BOT_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-recording-bot-enabled-env-var-name';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';

export const getRecallRecordingBotEnabled = (): boolean =>
  isRecallRecordingBotEnabled(
    getApplicationVariableValue(RECALL_RECORDING_BOT_ENABLED_ENV_VAR_NAME),
  );
