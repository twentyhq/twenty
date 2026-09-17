import { definePostInstallLogicFunction } from 'twenty-sdk/define';

import { BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { startBackfill } from 'src/utils/start-backfill';

export default definePostInstallLogicFunction({
  universalIdentifier: BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-last-contact',
  description:
    'Counts people, opportunities and companies after installation and enqueues one backfill job per record batch.',
  timeoutSeconds: 300,
  shouldRunOnVersionUpgrade: false,
  handler: startBackfill,
});
