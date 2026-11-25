import { CALL_RECORDER_STYLE_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-style-env-var-name';
import { DEFAULT_CALL_RECORDER_STYLE } from 'src/logic-functions/constants/default-call-recorder-style';
import { type CallRecorderStyle } from 'src/logic-functions/types/call-recorder-style.type';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isCallRecorderStyle } from 'src/logic-functions/utils/is-call-recorder-style.util';

export const getCallRecorderStyle = (): CallRecorderStyle => {
  const rawValue = getApplicationVariableValue(
    CALL_RECORDER_STYLE_ENV_VAR_NAME,
  )?.trim();

  return isCallRecorderStyle(rawValue) ? rawValue : DEFAULT_CALL_RECORDER_STYLE;
};
