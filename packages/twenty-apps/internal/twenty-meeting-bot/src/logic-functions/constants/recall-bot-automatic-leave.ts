import { isUndefined } from '@sniptt/guards';

import { RECALL_BOT_EVERYONE_LEFT_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-bot-everyone-left-timeout-seconds-env-var-name';
import { RECALL_BOT_NOONE_JOINED_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-bot-noone-joined-timeout-seconds-env-var-name';
import { RECALL_BOT_WAITING_ROOM_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-bot-waiting-room-timeout-seconds-env-var-name';
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
    RECALL_BOT_WAITING_ROOM_TIMEOUT_SECONDS_ENV_VAR_NAME,
  );
  const nooneJoinedTimeoutSeconds = getOptionalPositiveIntegerVariable(
    RECALL_BOT_NOONE_JOINED_TIMEOUT_SECONDS_ENV_VAR_NAME,
  );
  const everyoneLeftTimeoutSeconds = getOptionalPositiveIntegerVariable(
    RECALL_BOT_EVERYONE_LEFT_TIMEOUT_SECONDS_ENV_VAR_NAME,
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
      activate_after: 0,
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
