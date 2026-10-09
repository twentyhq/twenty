import { CALL_RECORDER_SHOW_UNMATCHED_ATTENDEES_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-show-unmatched-attendees-env-var-name';
import { DEFAULT_CALL_RECORDER_SHOW_UNMATCHED_ATTENDEES } from 'src/logic-functions/constants/default-call-recorder-show-unmatched-attendees';
import { getApplicationVariableValue } from 'src/front-components/utils/get-application-variable-value.util';
import { parseBooleanApplicationVariableValue } from 'src/logic-functions/utils/parse-boolean-application-variable-value.util';

export const isShowUnmatchedAttendeesEnabled = (): boolean =>
  parseBooleanApplicationVariableValue({
    rawValue: getApplicationVariableValue(
      CALL_RECORDER_SHOW_UNMATCHED_ATTENDEES_ENV_VAR_NAME,
    ),
    defaultValue: DEFAULT_CALL_RECORDER_SHOW_UNMATCHED_ATTENDEES,
  });
