import { defineApplication, FieldType } from 'twenty-sdk/define';

import {
  BACKFILL_BATCH_SIZE_ENV_VAR_NAME,
  BACKFILL_SLEEP_MS_ENV_VAR_NAME,
  DEFAULT_BACKFILL_BATCH_SIZE,
  DEFAULT_BACKFILL_SLEEP_MS,
} from 'src/constants/backfill';
import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  logoUrl: 'public/logo.png',
  author: 'Twenty',
  category: 'Productivity',
  screenshots: ['public/gallery/cover.png'],
  displayName: APP_DISPLAY_NAME,
  canActWithoutUser: true,
  description: APP_DESCRIPTION,
  serverVariables: {
    [BACKFILL_BATCH_SIZE_ENV_VAR_NAME]: {
      description: `How many records each last-contact backfill job processes. Also sets how many batch jobs are enqueued (record count divided by this). Defaults to ${DEFAULT_BACKFILL_BATCH_SIZE} when unset.`,
      isSecret: false,
      type: FieldType.NUMBER,
    },
    [BACKFILL_SLEEP_MS_ENV_VAR_NAME]: {
      description: `How many milliseconds to stagger consecutive backfill jobs by, so they do not all run at once and hit the API rate limiting. Defaults to ${DEFAULT_BACKFILL_SLEEP_MS} when unset.`,
      isSecret: false,
      type: FieldType.NUMBER,
    },
  },
});
