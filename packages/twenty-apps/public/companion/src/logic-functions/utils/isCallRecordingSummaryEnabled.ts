import { COMPANION_SUMMARY_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/COMPANION_SUMMARY_ENABLED_ENV_VAR_NAME';
import { DEFAULT_COMPANION_SUMMARY_ENABLED } from 'src/logic-functions/constants/DEFAULT_COMPANION_SUMMARY_ENABLED';
import { getBooleanApplicationVariableValue } from 'src/logic-functions/utils/getBooleanApplicationVariableValue';

export const isCallRecordingSummaryEnabled = (): boolean =>
  getBooleanApplicationVariableValue({
    applicationVariableName: COMPANION_SUMMARY_ENABLED_ENV_VAR_NAME,
    defaultValue: DEFAULT_COMPANION_SUMMARY_ENABLED,
  });
