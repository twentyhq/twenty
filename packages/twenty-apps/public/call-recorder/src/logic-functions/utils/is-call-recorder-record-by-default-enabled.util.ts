import { CALL_RECORDER_RECORD_BY_DEFAULT_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-record-by-default-env-var-name';
import { DEFAULT_CALL_RECORDER_RECORD_BY_DEFAULT } from 'src/logic-functions/constants/default-call-recorder-record-by-default';
import { getApplicationVariableBooleanValue } from 'src/logic-functions/utils/get-application-variable-boolean-value.util';

export const isCallRecorderRecordByDefaultEnabled = (): boolean =>
  getApplicationVariableBooleanValue({
    envVarName: CALL_RECORDER_RECORD_BY_DEFAULT_ENV_VAR_NAME,
    defaultValue: DEFAULT_CALL_RECORDER_RECORD_BY_DEFAULT,
  });
