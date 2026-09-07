import { CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-calendar-bot-scheduling-enabled-env-var-name';
import { DEFAULT_CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED } from 'src/logic-functions/constants/default-call-recorder-calendar-bot-scheduling-enabled';
import { getBooleanApplicationVariableValue } from 'src/logic-functions/utils/get-boolean-application-variable-value.util';

export const isCalendarBotSchedulingEnabled = (): boolean =>
  getBooleanApplicationVariableValue({
    applicationVariableName:
      CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME,
    defaultValue: DEFAULT_CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED,
  });
