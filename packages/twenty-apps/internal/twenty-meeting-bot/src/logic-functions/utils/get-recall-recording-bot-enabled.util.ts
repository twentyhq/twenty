import { RECALL_RECORDING_BOT_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-recording-bot-enabled-env-var-name';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isRecallRecordingBotEnabled } from 'src/logic-functions/utils/is-recall-recording-bot-enabled.util';

export const getRecallRecordingBotEnabled = (): boolean =>
  isRecallRecordingBotEnabled(
    getApplicationVariableValue(RECALL_RECORDING_BOT_ENABLED_ENV_VAR_NAME),
  );
