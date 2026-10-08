import { CALL_RECORDER_USE_WORKSPACE_LOGO_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-use-workspace-logo-env-var-name';
import { DEFAULT_CALL_RECORDER_USE_WORKSPACE_LOGO } from 'src/logic-functions/constants/default-call-recorder-use-workspace-logo';
import { getBooleanApplicationVariableValue } from 'src/logic-functions/utils/get-boolean-application-variable-value.util';

export const isWorkspaceLogoBotImageEnabled = (): boolean =>
  getBooleanApplicationVariableValue({
    applicationVariableName: CALL_RECORDER_USE_WORKSPACE_LOGO_ENV_VAR_NAME,
    defaultValue: DEFAULT_CALL_RECORDER_USE_WORKSPACE_LOGO,
  });
