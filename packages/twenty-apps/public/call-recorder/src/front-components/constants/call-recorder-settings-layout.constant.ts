import {
  IconCalendarEvent,
  IconClockPlay,
  IconDoorEnter,
  IconHourglassHigh,
  IconLanguage,
  IconMessage,
  IconPlayerStop,
  IconSparkles,
  type IconComponent,
} from 'twenty-ui/icon';

import { CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-additional-summary-prompt-env-var-name';
import { CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-calendar-bot-scheduling-enabled-env-var-name';
import { CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-everyone-left-timeout-seconds-env-var-name';
import { CALL_RECORDER_JOIN_EARLY_MINUTES_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-join-early-minutes-env-var-name';
import { CALL_RECORDER_NAME_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-name-env-var-name';
import { CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-noone-joined-timeout-seconds-env-var-name';
import { CALL_RECORDER_RECORDING_NOTICE_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-recording-notice-enabled-env-var-name';
import { CALL_RECORDER_RECORDING_NOTICE_MAX_LENGTH } from 'src/logic-functions/constants/call-recorder-recording-notice-max-length';
import { CALL_RECORDER_RECORDING_NOTICE_MESSAGE_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-recording-notice-message-env-var-name';
import { CALL_RECORDER_STYLE_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-style-env-var-name';
import { CALL_RECORDER_SUMMARY_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-summary-enabled-env-var-name';
import { CALL_RECORDER_TRANSCRIPT_PROVIDER_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-transcript-provider-env-var-name';
import { CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-waiting-room-timeout-seconds-env-var-name';
import { type CallRecorderStyle } from 'src/logic-functions/types/call-recorder-style.type';

export type CallRecorderCounterRow = {
  variableKey: string;
  title: string;
  description: string;
  Icon: IconComponent;
};

export const CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW = {
  variableKey: CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME,
  title: 'Record my calendar meetings',
  description: 'Joins every meeting with a supported video link.',
  Icon: IconCalendarEvent,
};

export const CALL_RECORDER_RECORDING_NOTICE_ROW = {
  variableKey: CALL_RECORDER_RECORDING_NOTICE_ENABLED_ENV_VAR_NAME,
  title: 'Send recording notice',
  description:
    'Post a notice in the meeting chat when the recorder joins. Zoom, Google Meet and Microsoft Teams only.',
  Icon: IconMessage,
};

export const CALL_RECORDER_RECORDING_NOTICE_MESSAGE_FIELD = {
  variableKey: CALL_RECORDER_RECORDING_NOTICE_MESSAGE_ENV_VAR_NAME,
  label: 'Recording notice message',
  hint: `Truncated to ${CALL_RECORDER_RECORDING_NOTICE_MAX_LENGTH} characters for Google Meet.`,
};

export const CALL_RECORDER_TIMING_ROWS: CallRecorderCounterRow[] = [
  {
    variableKey: CALL_RECORDER_JOIN_EARLY_MINUTES_ENV_VAR_NAME,
    title: 'Join before start',
    description:
      'Minutes before the scheduled start time. Set 0 to join on time.',
    Icon: IconClockPlay,
  },
  {
    variableKey: CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS_ENV_VAR_NAME,
    title: 'Leave the lobby after',
    description: 'Seconds the recorder waits to be admitted before giving up.',
    Icon: IconDoorEnter,
  },
  {
    variableKey: CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS_ENV_VAR_NAME,
    title: 'Leave an empty call after',
    description: 'Seconds to wait when nobody else ever joins the meeting.',
    Icon: IconHourglassHigh,
  },
  {
    variableKey: CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS_ENV_VAR_NAME,
    title: 'Keep recording after everyone leaves',
    description: 'Seconds of grace before the recording is ended.',
    Icon: IconPlayerStop,
  },
];

export const CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW = {
  variableKey: CALL_RECORDER_TRANSCRIPT_PROVIDER_ENV_VAR_NAME,
  title: 'Transcript provider',
  description: 'Speech-to-text service used once the call ends.',
  Icon: IconLanguage,
};

export const CALL_RECORDER_SUMMARY_ENABLED_ROW = {
  variableKey: CALL_RECORDER_SUMMARY_ENABLED_ENV_VAR_NAME,
  title: 'AI summaries',
  description: 'Generate a summary for every recording. Uses AI credits.',
  Icon: IconSparkles,
};

export const CALL_RECORDER_STYLE_FIELD = {
  variableKey: CALL_RECORDER_STYLE_ENV_VAR_NAME,
  label: 'Style',
  hint: 'Applies to recorders scheduled after you change it.',
};

export const CALL_RECORDER_STYLE_DESCRIPTIONS: Record<
  CallRecorderStyle,
  string
> = {
  TWENTY: 'Shows the Twenty logo and name.',
  WORKSPACE: 'Uses the workspace name and logo from Settings > General.',
  MINIMAL: 'Shows the word Twenty, no logo.',
  NONE: 'Sends no image. People only see the recorder name.',
};

export const CALL_RECORDER_NAME_FIELD = {
  variableKey: CALL_RECORDER_NAME_ENV_VAR_NAME,
  label: 'Recorder name',
  hint: 'Shown to everyone else in the meeting when the recorder joins.',
};

export const CALL_RECORDER_SUMMARY_PROMPT_FIELD = {
  variableKey: CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME,
  label: 'Extra summary instructions',
  hint: 'Appended to the built-in prompt. Leave empty to use it alone.',
};

// Keep this list aligned with the app config so every application variable is
// intentionally placed in the synchronous settings UI.
export const CALL_RECORDER_MAPPED_VARIABLE_KEYS: string[] = [
  CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ROW.variableKey,
  CALL_RECORDER_NAME_FIELD.variableKey,
  CALL_RECORDER_RECORDING_NOTICE_ROW.variableKey,
  CALL_RECORDER_RECORDING_NOTICE_MESSAGE_FIELD.variableKey,
  ...CALL_RECORDER_TIMING_ROWS.map((row) => row.variableKey),
  CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.variableKey,
  CALL_RECORDER_SUMMARY_ENABLED_ROW.variableKey,
  CALL_RECORDER_SUMMARY_PROMPT_FIELD.variableKey,
  CALL_RECORDER_STYLE_FIELD.variableKey,
];
