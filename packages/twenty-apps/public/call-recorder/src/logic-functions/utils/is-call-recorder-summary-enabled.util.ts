import { CALL_RECORDER_SUMMARY_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-summary-enabled-env-var-name';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';

// On by default: summaries generate unless an admin explicitly sets the
// application variable to 'false'. An unset value keeps the default behavior.
export const isCallRecorderSummaryEnabled = (): boolean =>
  getApplicationVariableValue(
    CALL_RECORDER_SUMMARY_ENABLED_ENV_VAR_NAME,
  )?.trim().toLowerCase() !== 'false';
