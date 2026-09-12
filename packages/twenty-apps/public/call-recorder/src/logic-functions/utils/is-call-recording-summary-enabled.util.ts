import { CALL_RECORDER_SUMMARY_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-summary-enabled-env-var-name';
import { DEFAULT_CALL_RECORDER_SUMMARY_ENABLED } from 'src/logic-functions/constants/default-call-recorder-summary-enabled';
import { getBooleanApplicationVariableValue } from 'src/logic-functions/utils/get-boolean-application-variable-value.util';

export const isCallRecordingSummaryEnabled = (): boolean =>
  getBooleanApplicationVariableValue({
    applicationVariableName: CALL_RECORDER_SUMMARY_ENABLED_ENV_VAR_NAME,
    defaultValue: DEFAULT_CALL_RECORDER_SUMMARY_ENABLED,
  });
