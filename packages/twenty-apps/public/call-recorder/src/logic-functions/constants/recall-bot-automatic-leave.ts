import { isUndefined } from '@sniptt/guards';

import { CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-everyone-left-timeout-seconds-env-var-name';
import { CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-noone-joined-timeout-seconds-env-var-name';
import { CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-waiting-room-timeout-seconds-env-var-name';
import { RECALL_BOT_EVERYONE_LEFT_MIN_ACTIVATE_AFTER_SECONDS } from 'src/logic-functions/constants/recall-bot-everyone-left-min-activate-after-seconds';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type RecallBotAutomaticLeave = {
  waiting_room_timeout?: number;
  noone_joined_timeout?: number;
  everyone_left_timeout?: {
    timeout: number;
    activate_after: number;
  };
};

export const getRecallBotAutomaticLeave = ():
  | RecallBotAutomaticLeave
  | undefined => {
  const waitingRoomTimeoutSeconds = getOptionalPositiveIntegerVariable(
    CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS_ENV_VAR_NAME,
  );
  const nooneJoinedTimeoutSeconds = getOptionalPositiveIntegerVariable(
    CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS_ENV_VAR_NAME,
  );
  const everyoneLeftTimeoutSeconds = getOptionalPositiveIntegerVariable(
    CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS_ENV_VAR_NAME,
  );

  const automaticLeave: RecallBotAutomaticLeave = {};

  if (!isUndefined(waitingRoomTimeoutSeconds)) {
    automaticLeave.waiting_room_timeout = waitingRoomTimeoutSeconds;
  }

  if (!isUndefined(nooneJoinedTimeoutSeconds)) {
    automaticLeave.noone_joined_timeout = nooneJoinedTimeoutSeconds;
  }

  if (!isUndefined(everyoneLeftTimeoutSeconds)) {
    automaticLeave.everyone_left_timeout = {
      timeout: everyoneLeftTimeoutSeconds,
      activate_after: RECALL_BOT_EVERYONE_LEFT_MIN_ACTIVATE_AFTER_SECONDS,
    };
  }

  return Object.keys(automaticLeave).length === 0 ? undefined : automaticLeave;
};

const getOptionalPositiveIntegerVariable = (
  variableName: string,
): number | undefined => {
  const rawValue = normalizeOptionalString(
    getApplicationVariableValue(variableName),
  );

  if (isUndefined(rawValue)) {
    return undefined;
  }

  const timeoutSeconds = Number(rawValue);

  if (!Number.isInteger(timeoutSeconds) || timeoutSeconds <= 0) {
    return undefined;
  }

  return timeoutSeconds;
};

const normalizeOptionalString = (
  value: string | undefined,
): string | undefined => (isNonEmptyString(value) ? value.trim() : undefined);
