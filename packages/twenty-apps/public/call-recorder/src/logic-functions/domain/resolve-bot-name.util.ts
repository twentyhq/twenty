import { CALL_RECORDER_NAME_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-name-env-var-name';
import { DEFAULT_CALL_RECORDER_NAME } from 'src/logic-functions/constants/default-call-recorder-name';
import { getWorkspaceDisplayName } from 'src/logic-functions/data/get-workspace-display-name.util';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

// An admin-set name wins verbatim. Otherwise the bot is named after the workspace
// (e.g. "Twenty.com (Acme)") so meeting hosts can recognize it before admitting it.
export const resolveBotName = async (): Promise<string> => {
  const configuredName = getApplicationVariableValue(
    CALL_RECORDER_NAME_ENV_VAR_NAME,
  );

  if (isNonEmptyString(configuredName)) {
    return configuredName.trim();
  }

  const workspaceName = await getWorkspaceDisplayName();

  return isNonEmptyString(workspaceName)
    ? `${DEFAULT_CALL_RECORDER_NAME} (${workspaceName})`
    : DEFAULT_CALL_RECORDER_NAME;
};
