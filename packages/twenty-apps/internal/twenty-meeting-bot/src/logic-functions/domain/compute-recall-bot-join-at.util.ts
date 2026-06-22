import { DEFAULT_MEETING_BOT_JOIN_EARLY_MINUTES } from 'src/logic-functions/constants/default-meeting-bot-join-early-minutes';
import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';
import { MEETING_BOT_JOIN_EARLY_MINUTES_ENV_VAR_NAME } from 'src/logic-functions/constants/meeting-bot-join-early-minutes-env-var-name';
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
    MEETING_BOT_JOIN_EARLY_MINUTES_ENV_VAR_NAME,
  );

  if (!isNonEmptyString(rawValue)) {
    return DEFAULT_MEETING_BOT_JOIN_EARLY_MINUTES;
  }

  const joinEarlyMinutes = Number(rawValue.trim());

  return Number.isInteger(joinEarlyMinutes) && joinEarlyMinutes >= 0
    ? joinEarlyMinutes
    : DEFAULT_MEETING_BOT_JOIN_EARLY_MINUTES;
};
