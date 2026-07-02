import { CALL_RECORDER_USE_WORKSPACE_LOGO_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-use-workspace-logo-env-var-name';
import { DEFAULT_CALL_RECORDER_USE_WORKSPACE_LOGO } from 'src/logic-functions/constants/default-call-recorder-use-workspace-logo';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const TRUTHY_VALUES = new Set(['true', '1', 'yes', 'on']);
const FALSY_VALUES = new Set(['false', '0', 'no', 'off']);

export const isWorkspaceLogoBotImageEnabled = (): boolean => {
  const rawValue = getApplicationVariableValue(
    CALL_RECORDER_USE_WORKSPACE_LOGO_ENV_VAR_NAME,
  );

  if (!isNonEmptyString(rawValue)) {
    return DEFAULT_CALL_RECORDER_USE_WORKSPACE_LOGO;
  }

  const normalizedValue = rawValue.trim().toLowerCase();

  if (TRUTHY_VALUES.has(normalizedValue)) {
    return true;
  }

  if (FALSY_VALUES.has(normalizedValue)) {
    return false;
  }

  return DEFAULT_CALL_RECORDER_USE_WORKSPACE_LOGO;
};
