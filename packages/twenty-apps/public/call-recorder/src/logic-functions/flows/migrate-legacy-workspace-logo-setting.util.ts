import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { CALL_RECORDER_STYLE_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-style-env-var-name';
import { CALL_RECORDER_STYLES_INTRODUCED_VERSION } from 'src/logic-functions/constants/call-recorder-styles-introduced-version';
import { CALL_RECORDER_USE_WORKSPACE_LOGO_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-use-workspace-logo-env-var-name';
import { DEFAULT_CALL_RECORDER_USE_WORKSPACE_LOGO } from 'src/logic-functions/constants/default-call-recorder-use-workspace-logo';
import { type CallRecorderStyle } from 'src/logic-functions/types/call-recorder-style.type';
import { getBooleanApplicationVariableValue } from 'src/logic-functions/utils/get-boolean-application-variable-value.util';
import { isVersionLowerThan } from 'src/logic-functions/utils/is-version-lower-than.util';

// Workspaces upgrading from before recorder styles keep what they showed:
// their logo, or nothing if they had turned it off.
export const migrateLegacyWorkspaceLogoSetting = async (
  previousVersion: string,
): Promise<CallRecorderStyle | undefined> => {
  if (
    !isVersionLowerThan(
      previousVersion,
      CALL_RECORDER_STYLES_INTRODUCED_VERSION,
    )
  ) {
    return undefined;
  }

  const style: CallRecorderStyle = getBooleanApplicationVariableValue({
    applicationVariableName: CALL_RECORDER_USE_WORKSPACE_LOGO_ENV_VAR_NAME,
    defaultValue: DEFAULT_CALL_RECORDER_USE_WORKSPACE_LOGO,
  })
    ? 'WORKSPACE'
    : 'NONE';

  await new MetadataApiClient().mutation({
    updateOneApplicationVariable: {
      __args: { key: CALL_RECORDER_STYLE_ENV_VAR_NAME, value: style },
    },
  });

  return style;
};
