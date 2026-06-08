import { defineApplication } from 'twenty-sdk/define';

import { APP_DESCRIPTION } from 'src/constants/app-description';
import { APP_DISPLAY_NAME } from 'src/constants/app-display-name';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/application-universal-identifier';
import { CRON_INTERVAL_MINUTES_APP_VARIABLE_UNIVERSAL_IDENTIFIER } from 'src/constants/cron-interval-minutes-app-variable-universal-identifier';
import { ENABLED_APP_VARIABLE_UNIVERSAL_IDENTIFIER } from 'src/constants/enabled-app-variable-universal-identifier';
import { DEFAULT_CRON_INTERVAL_MINUTES } from 'src/logic-functions/constants/default-cron-interval-minutes';
import { DEFAULT_RECALL_RECORDING_BOT_ENABLED } from 'src/logic-functions/constants/default-recall-recording-bot-enabled';
import { RECALL_RECORDING_BOT_CRON_INTERVAL_MINUTES_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-recording-bot-cron-interval-minutes-env-var-name';
import { RECALL_RECORDING_BOT_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-recording-bot-enabled-env-var-name';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  applicationVariables: {
    [RECALL_RECORDING_BOT_ENABLED_ENV_VAR_NAME]: {
      universalIdentifier: ENABLED_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'Whether the Recall recording bot policy is enabled for this workspace. Set to false to cancel app-managed scheduled requests and stop creating new ones.',
      isSecret: false,
      value: String(DEFAULT_RECALL_RECORDING_BOT_ENABLED),
    },
    [RECALL_RECORDING_BOT_CRON_INTERVAL_MINUTES_ENV_VAR_NAME]: {
      universalIdentifier:
        CRON_INTERVAL_MINUTES_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'Effective backstop reconciliation interval in minutes. Calendar-event database triggers run immediately; this cron wakes every minute and skips work until this interval matches.',
      isSecret: false,
      value: String(DEFAULT_CRON_INTERVAL_MINUTES),
    },
  },
});
