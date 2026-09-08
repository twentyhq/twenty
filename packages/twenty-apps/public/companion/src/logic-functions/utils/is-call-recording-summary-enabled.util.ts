import { COMPANION_SUMMARY_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/companion-summary-enabled-env-var-name';
import { DEFAULT_COMPANION_SUMMARY_ENABLED } from 'src/logic-functions/constants/default-companion-summary-enabled';
import { getBooleanApplicationVariableValue } from 'src/logic-functions/utils/get-boolean-application-variable-value.util';

export const isCallRecordingSummaryEnabled = (): boolean =>
  getBooleanApplicationVariableValue({
    applicationVariableName: COMPANION_SUMMARY_ENABLED_ENV_VAR_NAME,
    defaultValue: DEFAULT_COMPANION_SUMMARY_ENABLED,
  });
