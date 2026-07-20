import { CALL_RECORDER_BOT_DETECTION_USING_PARTICIPANT_EVENTS_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-bot-detection-using-participant-events-enabled-env-var-name';
import { DEFAULT_CALL_RECORDER_BOT_DETECTION_USING_PARTICIPANT_EVENTS_ENABLED } from 'src/logic-functions/constants/default-call-recorder-bot-detection-using-participant-events-enabled';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const TRUTHY_VALUES = new Set(['true', '1', 'yes', 'on']);
const FALSY_VALUES = new Set(['false', '0', 'no', 'off']);

export const isCallRecorderBotDetectionUsingParticipantEventsEnabled =
  (): boolean => {
    const rawValue = getApplicationVariableValue(
      CALL_RECORDER_BOT_DETECTION_USING_PARTICIPANT_EVENTS_ENABLED_ENV_VAR_NAME,
    );

    if (!isNonEmptyString(rawValue)) {
      return DEFAULT_CALL_RECORDER_BOT_DETECTION_USING_PARTICIPANT_EVENTS_ENABLED;
    }

    const normalizedValue = rawValue.trim().toLowerCase();

    if (TRUTHY_VALUES.has(normalizedValue)) {
      return true;
    }

    if (FALSY_VALUES.has(normalizedValue)) {
      return false;
    }

    return DEFAULT_CALL_RECORDER_BOT_DETECTION_USING_PARTICIPANT_EVENTS_ENABLED;
  };
