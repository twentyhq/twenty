import { defineLogicFunction } from 'twenty-sdk/define';

import { RUN_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { startBackfill } from 'src/utils/start-backfill';

export default defineLogicFunction({
  universalIdentifier: RUN_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'run-backfill',
  description:
    'Counts people, opportunities and companies and enqueues one backfill job per record batch. Same work as the post-install hook, on demand from the settings panel.',
  timeoutSeconds: 300,
  handler: startBackfill,
});
