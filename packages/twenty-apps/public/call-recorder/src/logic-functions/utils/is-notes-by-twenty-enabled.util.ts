import { CALL_RECORDER_NOTES_BY_TWENTY_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-notes-by-twenty-enabled-env-var-name';
import { DEFAULT_CALL_RECORDER_NOTES_BY_TWENTY_ENABLED } from 'src/logic-functions/constants/default-call-recorder-notes-by-twenty-enabled';
import { getBooleanApplicationVariableValue } from 'src/logic-functions/utils/get-boolean-application-variable-value.util';

export const isNotesByTwentyEnabled = (): boolean =>
  getBooleanApplicationVariableValue({
    applicationVariableName: CALL_RECORDER_NOTES_BY_TWENTY_ENABLED_ENV_VAR_NAME,
    defaultValue: DEFAULT_CALL_RECORDER_NOTES_BY_TWENTY_ENABLED,
  });
