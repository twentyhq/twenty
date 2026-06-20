import { defineApplication } from 'twenty-sdk/define';

import { APP_DESCRIPTION } from 'src/constants/app-description';
import { APP_DISPLAY_NAME } from 'src/constants/app-display-name';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/application-universal-identifier';
import { MEETING_BOT_EVERYONE_LEFT_TIMEOUT_SECONDS_APP_VARIABLE_UNIVERSAL_IDENTIFIER } from 'src/constants/meeting-bot-everyone-left-timeout-seconds-app-variable-universal-identifier';
import { MEETING_BOT_JOIN_EARLY_MINUTES_APP_VARIABLE_UNIVERSAL_IDENTIFIER } from 'src/constants/meeting-bot-join-early-minutes-app-variable-universal-identifier';
import { MEETING_BOT_NAME_APP_VARIABLE_UNIVERSAL_IDENTIFIER } from 'src/constants/meeting-bot-name-app-variable-universal-identifier';
import { MEETING_BOT_NOONE_JOINED_TIMEOUT_SECONDS_APP_VARIABLE_UNIVERSAL_IDENTIFIER } from 'src/constants/meeting-bot-noone-joined-timeout-seconds-app-variable-universal-identifier';
import { MEETING_BOT_WAITING_ROOM_TIMEOUT_SECONDS_APP_VARIABLE_UNIVERSAL_IDENTIFIER } from 'src/constants/meeting-bot-waiting-room-timeout-seconds-app-variable-universal-identifier';
import { DEFAULT_MEETING_BOT_JOIN_EARLY_MINUTES } from 'src/logic-functions/constants/default-meeting-bot-join-early-minutes';
import { DEFAULT_MEETING_BOT_NAME } from 'src/logic-functions/constants/default-meeting-bot-name';
import { DEFAULT_RECALL_REGION } from 'src/logic-functions/constants/default-recall-region';
import { MEETING_BOT_EVERYONE_LEFT_TIMEOUT_SECONDS } from 'src/logic-functions/constants/meeting-bot-everyone-left-timeout-seconds';
import { MEETING_BOT_EVERYONE_LEFT_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/meeting-bot-everyone-left-timeout-seconds-env-var-name';
import { MEETING_BOT_JOIN_EARLY_MINUTES_ENV_VAR_NAME } from 'src/logic-functions/constants/meeting-bot-join-early-minutes-env-var-name';
import { MEETING_BOT_NAME_ENV_VAR_NAME } from 'src/logic-functions/constants/meeting-bot-name-env-var-name';
import { MEETING_BOT_NOONE_JOINED_TIMEOUT_SECONDS } from 'src/logic-functions/constants/meeting-bot-noone-joined-timeout-seconds';
import { MEETING_BOT_NOONE_JOINED_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/meeting-bot-noone-joined-timeout-seconds-env-var-name';
import { MEETING_BOT_WAITING_ROOM_TIMEOUT_SECONDS } from 'src/logic-functions/constants/meeting-bot-waiting-room-timeout-seconds';
import { MEETING_BOT_WAITING_ROOM_TIMEOUT_SECONDS_ENV_VAR_NAME } from 'src/logic-functions/constants/meeting-bot-waiting-room-timeout-seconds-env-var-name';
import { RECALL_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-api-key-env-var-name';
import { RECALL_REGION_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-region-env-var-name';
import { RECALL_WEBHOOK_SECRET_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-webhook-secret-env-var-name';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  logoUrl: 'public/logo.svg',
  applicationVariables: {
    [MEETING_BOT_NAME_ENV_VAR_NAME]: {
      universalIdentifier: MEETING_BOT_NAME_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      description: 'Display name the meeting bot uses when it joins a call.',
      isSecret: false,
      value: DEFAULT_MEETING_BOT_NAME,
    },
    [MEETING_BOT_JOIN_EARLY_MINUTES_ENV_VAR_NAME]: {
      universalIdentifier:
        MEETING_BOT_JOIN_EARLY_MINUTES_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'How many minutes before the meeting start time the bot should join. Set to 0 to join at the scheduled start time.',
      isSecret: false,
      value: String(DEFAULT_MEETING_BOT_JOIN_EARLY_MINUTES),
    },
    [MEETING_BOT_WAITING_ROOM_TIMEOUT_SECONDS_ENV_VAR_NAME]: {
      universalIdentifier:
        MEETING_BOT_WAITING_ROOM_TIMEOUT_SECONDS_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'How many seconds the bot waits in a meeting lobby before giving up and leaving.',
      isSecret: false,
      value: String(MEETING_BOT_WAITING_ROOM_TIMEOUT_SECONDS),
    },
    [MEETING_BOT_NOONE_JOINED_TIMEOUT_SECONDS_ENV_VAR_NAME]: {
      universalIdentifier:
        MEETING_BOT_NOONE_JOINED_TIMEOUT_SECONDS_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'How many seconds the bot stays in an empty meeting when no one else ever joins.',
      isSecret: false,
      value: String(MEETING_BOT_NOONE_JOINED_TIMEOUT_SECONDS),
    },
    [MEETING_BOT_EVERYONE_LEFT_TIMEOUT_SECONDS_ENV_VAR_NAME]: {
      universalIdentifier:
        MEETING_BOT_EVERYONE_LEFT_TIMEOUT_SECONDS_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'How many seconds the bot keeps recording after everyone else leaves the meeting.',
      isSecret: false,
      value: String(MEETING_BOT_EVERYONE_LEFT_TIMEOUT_SECONDS),
    },
  },
  serverVariables: {
    [RECALL_API_KEY_ENV_VAR_NAME]: {
      description:
        'Recall.ai API key for the configured region. Set by the server admin on this registration after installation; used to create, update, and cancel scheduled meeting bots.',
      isSecret: true,
      isRequired: true,
    },
    [RECALL_REGION_ENV_VAR_NAME]: {
      description: `Recall.ai region used for API requests. Defaults to ${DEFAULT_RECALL_REGION} when unset. Europe Frankfurt is eu-central-1.`,
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
