import { defineApplication, FieldType } from 'twenty-sdk/define';

import { APP_DESCRIPTION } from 'src/constants/app-description';
import { APP_DISPLAY_NAME } from 'src/constants/app-display-name';
import { CALL_RECORDER_TRANSCRIPT_PROVIDER_OPTIONS } from 'src/constants/call-recorder-transcript-provider-options';
import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
  CALL_RECORDER_BOT_IMAGE_BACKGROUND_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
  CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
  CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
  CALL_RECORDER_JOIN_EARLY_MINUTES_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
  CALL_RECORDER_NAME_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
  CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
  CALL_RECORDER_RECORDING_NOTICE_ENABLED_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
  CALL_RECORDER_RECORDING_NOTICE_MESSAGE_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
  CALL_RECORDER_SUMMARY_ENABLED_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
  CALL_RECORDER_TRANSCRIPT_PROVIDER_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
  CALL_RECORDER_USE_WORKSPACE_LOGO_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
  CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { CALL_RECORDER_BOT_IMAGE_BACKGROUND_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-bot-image-background-env-var-name';
import { CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-calendar-bot-scheduling-enabled-env-var-name';
import { CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS } from 'src/logic-functions/constants/call-recorder-everyone-left-timeout-seconds';
import { CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-everyone-left-timeout-seconds-env-var-name';
import { CALL_RECORDER_JOIN_EARLY_MINUTES_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-join-early-minutes-env-var-name';
import { CALL_RECORDER_NAME_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-name-env-var-name';
import { CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS } from 'src/logic-functions/constants/call-recorder-noone-joined-timeout-seconds';
import { CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-noone-joined-timeout-seconds-env-var-name';
import { CALL_RECORDER_RECORDING_NOTICE_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-recording-notice-enabled-env-var-name';
import { CALL_RECORDER_RECORDING_NOTICE_MAX_LENGTH } from 'src/logic-functions/constants/call-recorder-recording-notice-max-length';
import { CALL_RECORDER_RECORDING_NOTICE_MESSAGE_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-recording-notice-message-env-var-name';
import { CALL_RECORDER_RECORDING_RETENTION_HOURS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-recording-retention-hours-env-var-name';
import { CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-additional-summary-prompt-env-var-name';
import { CALL_RECORDER_SUMMARY_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-summary-enabled-env-var-name';
import { CALL_RECORDER_TRANSCRIPT_PROVIDER_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-transcript-provider-env-var-name';
import { CALL_RECORDER_USE_WORKSPACE_LOGO_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-use-workspace-logo-env-var-name';
import { CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS } from 'src/logic-functions/constants/call-recorder-waiting-room-timeout-seconds';
import { CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-waiting-room-timeout-seconds-env-var-name';
import { DEFAULT_CALL_RECORDER_BOT_IMAGE_BACKGROUND } from 'src/logic-functions/constants/default-call-recorder-bot-image-background';
import { DEFAULT_CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED } from 'src/logic-functions/constants/default-call-recorder-calendar-bot-scheduling-enabled';
import { DEFAULT_CALL_RECORDER_JOIN_EARLY_MINUTES } from 'src/logic-functions/constants/default-call-recorder-join-early-minutes';
import { DEFAULT_CALL_RECORDER_NAME } from 'src/logic-functions/constants/default-call-recorder-name';
import { DEFAULT_CALL_RECORDER_RECORDING_NOTICE_ENABLED } from 'src/logic-functions/constants/default-call-recorder-recording-notice-enabled';
import { DEFAULT_CALL_RECORDER_RECORDING_NOTICE_MESSAGE } from 'src/logic-functions/constants/default-call-recorder-recording-notice-message';
import { DEFAULT_CALL_RECORDER_RECORDING_RETENTION_HOURS } from 'src/logic-functions/constants/default-call-recorder-recording-retention-hours';
import { DEFAULT_CALL_RECORDER_SUMMARY_ENABLED } from 'src/logic-functions/constants/default-call-recorder-summary-enabled';
import { DEFAULT_CALL_RECORDER_TRANSCRIPT_PROVIDER } from 'src/logic-functions/constants/default-call-recorder-transcript-provider';
import { DEFAULT_CALL_RECORDER_USE_WORKSPACE_LOGO } from 'src/logic-functions/constants/default-call-recorder-use-workspace-logo';
import { DEFAULT_RECALL_REGION } from 'src/logic-functions/constants/default-recall-region';
import { RECALL_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-api-key-env-var-name';
import { RECALL_REGION_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-region-env-var-name';
import { RECALL_WEBHOOK_SECRET_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-webhook-secret-env-var-name';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  logo: 'public/logo.svg',
  category: 'Productivity',
  author: 'Twenty',
  galleryImages: ['public/gallery/call-recorder-cover.png'],
  applicationVariables: {
    [CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME]: {
      universalIdentifier:
        CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Send bot to all my calendar meetings',
      description:
        'Whether the recorder is scheduled for every upcoming calendar meeting with a supported video link. Set to false to stop scheduling bots and cancel the ones already scheduled.',
      isSecret: false,
      type: FieldType.BOOLEAN,
      value: DEFAULT_CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED,
    },
    [CALL_RECORDER_NAME_ENV_VAR_NAME]: {
      universalIdentifier: CALL_RECORDER_NAME_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Recorder name',
      description: 'Display name the call recorder uses when it joins a call.',
      isSecret: false,
      type: FieldType.TEXT,
      value: DEFAULT_CALL_RECORDER_NAME,
    },
    [CALL_RECORDER_RECORDING_NOTICE_ENABLED_ENV_VAR_NAME]: {
      universalIdentifier:
        CALL_RECORDER_RECORDING_NOTICE_ENABLED_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Send recording notice',
      description:
        'Whether the bot sends a recording notice in supported meeting chats when it joins.',
      isSecret: false,
      type: FieldType.BOOLEAN,
      value: DEFAULT_CALL_RECORDER_RECORDING_NOTICE_ENABLED,
    },
    [CALL_RECORDER_RECORDING_NOTICE_MESSAGE_ENV_VAR_NAME]: {
      universalIdentifier:
        CALL_RECORDER_RECORDING_NOTICE_MESSAGE_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Recording notice message',
      description: `Message sent in supported meeting chats. Limited to ${CALL_RECORDER_RECORDING_NOTICE_MAX_LENGTH} characters for Google Meet compatibility; longer values are truncated.`,
      isSecret: false,
      type: FieldType.TEXT,
      value: DEFAULT_CALL_RECORDER_RECORDING_NOTICE_MESSAGE,
    },
    [CALL_RECORDER_JOIN_EARLY_MINUTES_ENV_VAR_NAME]: {
      universalIdentifier:
        CALL_RECORDER_JOIN_EARLY_MINUTES_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Join early (minutes)',
      description:
        'How many minutes before the meeting start time the bot should join. Set to 0 to join at the scheduled start time.',
      isSecret: false,
      type: FieldType.NUMBER,
      value: DEFAULT_CALL_RECORDER_JOIN_EARLY_MINUTES,
    },
    [CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS_ENV_VAR_NAME]: {
      universalIdentifier:
        CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Waiting room timeout (seconds)',
      description:
        'How many seconds the bot waits in a meeting lobby before giving up and leaving.',
      isSecret: false,
      type: FieldType.NUMBER,
      value: CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS,
    },
    [CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS_ENV_VAR_NAME]: {
      universalIdentifier:
        CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'No-one joined timeout (seconds)',
      description:
        'How many seconds the bot stays in an empty meeting when no one else ever joins.',
      isSecret: false,
      type: FieldType.NUMBER,
      value: CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS,
    },
    [CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS_ENV_VAR_NAME]: {
      universalIdentifier:
        CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Everyone left timeout (seconds)',
      description:
        'How many seconds the bot keeps recording after everyone else leaves the meeting.',
      isSecret: false,
      type: FieldType.NUMBER,
      value: CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS,
    },
    [CALL_RECORDER_TRANSCRIPT_PROVIDER_ENV_VAR_NAME]: {
      universalIdentifier:
        CALL_RECORDER_TRANSCRIPT_PROVIDER_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Transcript provider',
      description:
        'Speech-to-text provider used to transcribe recordings once the call ends. Recall.ai transcription needs no extra setup. Gladia re-detects the spoken language per utterance, which transcribes mixed-language calls more accurately, but requires a Gladia API key in the Recall.ai dashboard (Transcription > Gladia) for each region in use.',
      isSecret: false,
      type: FieldType.SELECT,
      options: CALL_RECORDER_TRANSCRIPT_PROVIDER_OPTIONS,
      value: DEFAULT_CALL_RECORDER_TRANSCRIPT_PROVIDER,
    },
    [CALL_RECORDER_SUMMARY_ENABLED_ENV_VAR_NAME]: {
      universalIdentifier:
        CALL_RECORDER_SUMMARY_ENABLED_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'AI summaries',
      description:
        'Whether AI summaries are generated for call recordings. Set to false to disable and avoid AI credit usage.',
      isSecret: false,
      type: FieldType.BOOLEAN,
      value: DEFAULT_CALL_RECORDER_SUMMARY_ENABLED,
    },
    [CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_ENV_VAR_NAME]: {
      universalIdentifier:
        CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Additional summary prompt',
      description:
        'Extra instructions appended to the built-in summary prompt (tone, language, focus areas). Leave empty to use the built-in prompt alone.',
      isSecret: false,
      type: FieldType.RICH_TEXT,
    },
    [CALL_RECORDER_USE_WORKSPACE_LOGO_ENV_VAR_NAME]: {
      universalIdentifier:
        CALL_RECORDER_USE_WORKSPACE_LOGO_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Use workspace logo',
      description:
        'Whether the bot displays the workspace logo on its camera tile while in a call. Set to false to disable.',
      isSecret: false,
      type: FieldType.BOOLEAN,
      value: DEFAULT_CALL_RECORDER_USE_WORKSPACE_LOGO,
    },
    [CALL_RECORDER_BOT_IMAGE_BACKGROUND_ENV_VAR_NAME]: {
      universalIdentifier:
        CALL_RECORDER_BOT_IMAGE_BACKGROUND_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Bot camera background color',
      description:
        'Hex color (e.g. #ffffff) drawn behind the workspace logo on the bot camera tile. Defaults to dark gray when unset or invalid.',
      isSecret: false,
      type: FieldType.TEXT,
      value: DEFAULT_CALL_RECORDER_BOT_IMAGE_BACKGROUND,
    },
  },
  serverVariables: {
    [RECALL_API_KEY_ENV_VAR_NAME]: {
      description:
        'Recall.ai API key for the configured region. Set by the server admin on this registration after installation; used to create, update, and cancel scheduled recording bots.',
      isSecret: true,
      isRequired: true,
      type: FieldType.TEXT,
    },
    [RECALL_REGION_ENV_VAR_NAME]: {
      description: `Recall.ai region used for API requests. Defaults to ${DEFAULT_RECALL_REGION} when unset. Europe Frankfurt is eu-central-1.`,
      isSecret: false,
      type: FieldType.SELECT,
      options: [
        { label: 'US West (us-west-2)', value: 'us-west-2' },
        { label: 'US East (us-east-1)', value: 'us-east-1' },
        { label: 'EU Frankfurt (eu-central-1)', value: 'eu-central-1' },
        { label: 'Asia Tokyo (ap-northeast-1)', value: 'ap-northeast-1' },
      ],
    },
    [CALL_RECORDER_RECORDING_RETENTION_HOURS_ENV_VAR_NAME]: {
      description: `How many hours Recall.ai retains recording media after processing. Defaults to ${DEFAULT_CALL_RECORDER_RECORDING_RETENTION_HOURS} hours (6 days and 22 hours) to stay below Recall.ai's 7-day free storage window. Values above 168 hours may incur Recall.ai storage charges.`,
      isSecret: false,
      type: FieldType.NUMBER,
    },
    [RECALL_WEBHOOK_SECRET_ENV_VAR_NAME]: {
      description:
        'Recall.ai webhook signing secret (whsec_...). Set by the server admin from the Recall webhook endpoint settings; used to verify the Svix signature of incoming Recall webhook deliveries.',
      isSecret: true,
      isRequired: true,
      type: FieldType.TEXT,
    },
  },
});
