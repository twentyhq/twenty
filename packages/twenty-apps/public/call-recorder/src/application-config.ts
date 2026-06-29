import { defineApplication } from 'twenty-sdk/define';

import { APP_DESCRIPTION } from 'src/constants/app-description';
import { APP_DISPLAY_NAME } from 'src/constants/app-display-name';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/application-universal-identifier';
import { CALL_RECORDER_BOT_IMAGE_BACKGROUND_APP_VARIABLE_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recorder-bot-image-background-app-variable-universal-identifier';
import { CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS_APP_VARIABLE_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recorder-everyone-left-timeout-seconds-app-variable-universal-identifier';
import { CALL_RECORDER_JOIN_EARLY_MINUTES_APP_VARIABLE_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recorder-join-early-minutes-app-variable-universal-identifier';
import { CALL_RECORDER_NAME_APP_VARIABLE_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recorder-name-app-variable-universal-identifier';
import { CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS_APP_VARIABLE_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recorder-noone-joined-timeout-seconds-app-variable-universal-identifier';
import { CALL_RECORDER_USE_WORKSPACE_LOGO_APP_VARIABLE_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recorder-use-workspace-logo-app-variable-universal-identifier';
import { CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS_APP_VARIABLE_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recorder-waiting-room-timeout-seconds-app-variable-universal-identifier';
import { CALL_RECORDER_BOT_IMAGE_BACKGROUND_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-bot-image-background-env-var-name';
import { CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS } from 'src/logic-functions/constants/call-recorder-everyone-left-timeout-seconds';
import { CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-everyone-left-timeout-seconds-env-var-name';
import { CALL_RECORDER_JOIN_EARLY_MINUTES_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-join-early-minutes-env-var-name';
import { CALL_RECORDER_NAME_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-name-env-var-name';
import { CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS } from 'src/logic-functions/constants/call-recorder-noone-joined-timeout-seconds';
import { CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-noone-joined-timeout-seconds-env-var-name';
import { CALL_RECORDER_RECORDING_RETENTION_HOURS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-recording-retention-hours-env-var-name';
import { CALL_RECORDER_USE_WORKSPACE_LOGO_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-use-workspace-logo-env-var-name';
import { CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS } from 'src/logic-functions/constants/call-recorder-waiting-room-timeout-seconds';
import { CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-waiting-room-timeout-seconds-env-var-name';
import { DEFAULT_CALL_RECORDER_BOT_IMAGE_BACKGROUND } from 'src/logic-functions/constants/default-call-recorder-bot-image-background';
import { DEFAULT_CALL_RECORDER_JOIN_EARLY_MINUTES } from 'src/logic-functions/constants/default-call-recorder-join-early-minutes';
import { DEFAULT_CALL_RECORDER_NAME } from 'src/logic-functions/constants/default-call-recorder-name';
import { DEFAULT_CALL_RECORDER_RECORDING_RETENTION_HOURS } from 'src/logic-functions/constants/default-call-recorder-recording-retention-hours';
import { DEFAULT_CALL_RECORDER_USE_WORKSPACE_LOGO } from 'src/logic-functions/constants/default-call-recorder-use-workspace-logo';
import { DEFAULT_RECALL_REGION } from 'src/logic-functions/constants/default-recall-region';
import { RECALL_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-api-key-env-var-name';
import { RECALL_REGION_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-region-env-var-name';
import { RECALL_WEBHOOK_SECRET_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-webhook-secret-env-var-name';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  logoUrl: 'public/logo.svg',
  author: 'Twenty',
  screenshots: ['public/gallery/call-recorder-cover.png'],
  applicationVariables: {
    [CALL_RECORDER_NAME_ENV_VAR_NAME]: {
      universalIdentifier: CALL_RECORDER_NAME_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      description: 'Display name the call recorder uses when it joins a call.',
      isSecret: false,
      value: DEFAULT_CALL_RECORDER_NAME,
    },
    [CALL_RECORDER_JOIN_EARLY_MINUTES_ENV_VAR_NAME]: {
      universalIdentifier:
        CALL_RECORDER_JOIN_EARLY_MINUTES_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'How many minutes before the meeting start time the bot should join. Set to 0 to join at the scheduled start time.',
      isSecret: false,
      value: String(DEFAULT_CALL_RECORDER_JOIN_EARLY_MINUTES),
    },
    [CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS_ENV_VAR_NAME]: {
      universalIdentifier:
        CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'How many seconds the bot waits in a meeting lobby before giving up and leaving.',
      isSecret: false,
      value: String(CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS),
    },
    [CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS_ENV_VAR_NAME]: {
      universalIdentifier:
        CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'How many seconds the bot stays in an empty meeting when no one else ever joins.',
      isSecret: false,
      value: String(CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS),
    },
    [CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS_ENV_VAR_NAME]: {
      universalIdentifier:
        CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'How many seconds the bot keeps recording after everyone else leaves the meeting.',
      isSecret: false,
      value: String(CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS),
    },
    [CALL_RECORDER_USE_WORKSPACE_LOGO_ENV_VAR_NAME]: {
      universalIdentifier:
        CALL_RECORDER_USE_WORKSPACE_LOGO_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'Whether the bot displays the workspace logo on its camera tile while in a call. Set to false to disable.',
      isSecret: false,
      value: String(DEFAULT_CALL_RECORDER_USE_WORKSPACE_LOGO),
    },
    [CALL_RECORDER_BOT_IMAGE_BACKGROUND_ENV_VAR_NAME]: {
      universalIdentifier:
        CALL_RECORDER_BOT_IMAGE_BACKGROUND_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'Hex color (e.g. #ffffff) drawn behind the workspace logo on the bot camera tile. Defaults to white when unset or invalid.',
      isSecret: false,
      value: DEFAULT_CALL_RECORDER_BOT_IMAGE_BACKGROUND,
    },
  },
  serverVariables: {
    [RECALL_API_KEY_ENV_VAR_NAME]: {
      description:
        'Recall.ai API key for the configured region. Set by the server admin on this registration after installation; used to create, update, and cancel scheduled recording bots.',
      isSecret: true,
      isRequired: true,
    },
    [RECALL_REGION_ENV_VAR_NAME]: {
      description: `Recall.ai region used for API requests. Defaults to ${DEFAULT_RECALL_REGION} when unset. Europe Frankfurt is eu-central-1.`,
      isSecret: false,
    },
    [CALL_RECORDER_RECORDING_RETENTION_HOURS_ENV_VAR_NAME]: {
      description: `How many hours Recall.ai retains recording media after processing. Defaults to ${DEFAULT_CALL_RECORDER_RECORDING_RETENTION_HOURS} hours (6 days and 22 hours) to stay below Recall.ai's 7-day free storage window. Values above 168 hours may incur Recall.ai storage charges.`,
      isSecret: false,
    },
    [RECALL_WEBHOOK_SECRET_ENV_VAR_NAME]: {
      description:
        'Recall.ai webhook signing secret (whsec_...). Set by the server admin from the Recall webhook endpoint settings; used to verify the Svix signature of incoming Recall webhook deliveries.',
      isSecret: true,
      isRequired: true,
    },
  },
});
