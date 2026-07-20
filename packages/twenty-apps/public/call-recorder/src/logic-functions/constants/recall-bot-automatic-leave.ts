import { isUndefined } from '@sniptt/guards';

import { CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-everyone-left-timeout-seconds-env-var-name';
import { CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-noone-joined-timeout-seconds-env-var-name';
import { CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-waiting-room-timeout-seconds-env-var-name';
import { RECALL_BOT_EVERYONE_LEFT_MIN_ACTIVATE_AFTER_SECONDS } from 'src/logic-functions/constants/recall-bot-everyone-left-min-activate-after-seconds';
import {
  RECALL_BOT_DETECTION_USING_PARTICIPANT_EVENTS_ACTIVATE_AFTER_SECONDS,
  RECALL_BOT_DETECTION_USING_PARTICIPANT_EVENTS_TIMEOUT_SECONDS,
  RECALL_BOT_DETECTION_USING_PARTICIPANT_NAMES_ACTIVATE_AFTER_SECONDS,
  RECALL_BOT_DETECTION_USING_PARTICIPANT_NAMES_TIMEOUT_SECONDS,
} from 'src/logic-functions/constants/recall-bot-detection-timeouts';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { getCallRecorderBotDetectionNameMatches } from 'src/logic-functions/utils/get-call-recorder-bot-detection-name-matches.util';
import { isCallRecorderBotDetectionUsingParticipantEventsEnabled } from 'src/logic-functions/utils/is-call-recorder-bot-detection-using-participant-events-enabled.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type RecallBotDetection = {
  using_participant_names?: {
    matches: string[];
    activate_after: number;
    timeout: number;
  };
  using_participant_events?: {
    activate_after: number;
    timeout: number;
  };
};

type RecallBotAutomaticLeave = {
  waiting_room_timeout?: number;
  noone_joined_timeout?: number;
  everyone_left_timeout?: {
    timeout: number;
    activate_after: number;
  };
  bot_detection?: RecallBotDetection;
};

export const getRecallBotAutomaticLeave = ({
  botName,
}: { botName?: string } = {}): RecallBotAutomaticLeave | undefined => {
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

  // everyone_left_timeout counts other recording bots as participants, so a call
  // where only bots remain never triggers it. bot_detection makes Recall treat
  // those bots as absent and leave once no humans are left.
  automaticLeave.bot_detection = getRecallBotDetection(botName);

  return Object.keys(automaticLeave).length === 0 ? undefined : automaticLeave;
};

const getRecallBotDetection = (botName?: string): RecallBotDetection => {
  const botDetection: RecallBotDetection = {
    using_participant_names: {
      matches: getCallRecorderBotDetectionNameMatches(botName),
      activate_after:
        RECALL_BOT_DETECTION_USING_PARTICIPANT_NAMES_ACTIVATE_AFTER_SECONDS,
      timeout: RECALL_BOT_DETECTION_USING_PARTICIPANT_NAMES_TIMEOUT_SECONDS,
    },
  };

  if (isCallRecorderBotDetectionUsingParticipantEventsEnabled()) {
    botDetection.using_participant_events = {
      activate_after:
        RECALL_BOT_DETECTION_USING_PARTICIPANT_EVENTS_ACTIVATE_AFTER_SECONDS,
      timeout: RECALL_BOT_DETECTION_USING_PARTICIPANT_EVENTS_TIMEOUT_SECONDS,
    };
  }

  return botDetection;
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
