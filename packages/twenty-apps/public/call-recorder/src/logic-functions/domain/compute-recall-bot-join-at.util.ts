import { DEFAULT_CALL_RECORDER_JOIN_EARLY_MINUTES } from 'src/logic-functions/constants/default-call-recorder-join-early-minutes';
import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';
import { CALL_RECORDER_JOIN_EARLY_MINUTES_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-join-early-minutes-env-var-name';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const computeRecallBotJoinAt = (meetingStartsAt: string): string => {
  const meetingStartTimeInMilliseconds = new Date(meetingStartsAt).getTime();

  if (Number.isNaN(meetingStartTimeInMilliseconds)) {
    return meetingStartsAt;
  }

  return new Date(
    meetingStartTimeInMilliseconds -
      getRecallBotJoinEarlyMinutes() * MILLISECONDS_PER_MINUTE,
  ).toISOString();
};

const getRecallBotJoinEarlyMinutes = (): number => {
  const rawValue = getApplicationVariableValue(
    CALL_RECORDER_JOIN_EARLY_MINUTES_ENV_VAR_NAME,
  );

  if (!isNonEmptyString(rawValue)) {
    return DEFAULT_CALL_RECORDER_JOIN_EARLY_MINUTES;
  }

  const joinEarlyMinutes = Number(rawValue.trim());

  return Number.isInteger(joinEarlyMinutes) && joinEarlyMinutes >= 0
    ? joinEarlyMinutes
    : DEFAULT_CALL_RECORDER_JOIN_EARLY_MINUTES;
};
