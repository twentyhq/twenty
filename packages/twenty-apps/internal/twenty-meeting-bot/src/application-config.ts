import { defineApplication } from 'twenty-sdk/define';

import { APP_DESCRIPTION } from 'src/constants/app-description';
import { APP_DISPLAY_NAME } from 'src/constants/app-display-name';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/application-universal-identifier';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/default-role-universal-identifier';
import { ENABLED_APP_VARIABLE_UNIVERSAL_IDENTIFIER } from 'src/constants/enabled-app-variable-universal-identifier';
import { SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/settings-front-component-universal-identifier';
import { RECALL_BOT_NAME_APP_VARIABLE_UNIVERSAL_IDENTIFIER } from 'src/constants/recall-bot-name-app-variable-universal-identifier';
import { DEFAULT_RECALL_RECORDING_BOT_ENABLED } from 'src/logic-functions/constants/default-recall-recording-bot-enabled';
import { DEFAULT_RECALL_BOT_NAME } from 'src/logic-functions/constants/default-recall-bot-name';
import { DEFAULT_RECALL_REGION } from 'src/logic-functions/constants/default-recall-region';
import { RECALL_RECORDING_BOT_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-recording-bot-enabled-env-var-name';
import { RECALL_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-api-key-env-var-name';
import { RECALL_BOT_NAME_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-bot-name-env-var-name';
import { RECALL_REGION_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-region-env-var-name';
import { RECALL_WEBHOOK_SECRET_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-webhook-secret-env-var-name';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  settingsCustomTabFrontComponentUniversalIdentifier:
    SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  applicationVariables: {
    [RECALL_RECORDING_BOT_ENABLED_ENV_VAR_NAME]: {
      universalIdentifier: ENABLED_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'Whether the Recall recording bot is enabled for this workspace. Disabled by default; set to true to opt in. Setting back to false cancels app-managed scheduled requests and stops creating new ones.',
      isSecret: false,
      value: String(DEFAULT_RECALL_RECORDING_BOT_ENABLED),
    },
    [RECALL_BOT_NAME_ENV_VAR_NAME]: {
      universalIdentifier: RECALL_BOT_NAME_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      description: 'Display name used when scheduling Recall.ai meeting bots.',
      isSecret: false,
      value: DEFAULT_RECALL_BOT_NAME,
    },
  },
  serverVariables: {
    [RECALL_API_KEY_ENV_VAR_NAME]: {
      description:
        'Recall.ai API key for the configured region. Set by the server admin on this registration after installation; used to create, update, and cancel scheduled meeting bots.',
      isSecret: true,
      isRequired: true,
    },
    [RECALL_WEBHOOK_SECRET_ENV_VAR_NAME]: {
      description:
        'Recall.ai webhook signing secret for verifying /webhook/recall deliveries. Set by the server admin on this registration after installation.',
      isSecret: true,
      isRequired: true,
    },
    [RECALL_REGION_ENV_VAR_NAME]: {
      description: `Recall.ai region used for API requests. Defaults to ${DEFAULT_RECALL_REGION} when unset. Asia Pacific Tokyo is ap-northeast-1.`,
      isSecret: false,
    },
  },
});
