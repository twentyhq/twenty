import { defineApplication } from 'twenty-sdk/define';

import { APP_DESCRIPTION } from 'src/constants/app-description';
import { APP_DISPLAY_NAME } from 'src/constants/app-display-name';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/application-universal-identifier';
import { RECALL_BOT_NAME_APP_VARIABLE_UNIVERSAL_IDENTIFIER } from 'src/constants/recall-bot-name-app-variable-universal-identifier';
import { DEFAULT_RECALL_BOT_NAME } from 'src/logic-functions/constants/default-recall-bot-name';
import { DEFAULT_RECALL_REGION } from 'src/logic-functions/constants/default-recall-region';
import { RECALL_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-api-key-env-var-name';
import { RECALL_BOT_NAME_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-bot-name-env-var-name';
import { RECALL_REGION_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-region-env-var-name';
import { RECALL_WEBHOOK_SECRET_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-webhook-secret-env-var-name';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  applicationVariables: {
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
