import { definePostInstallLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';

import {
  type BackfillState,
  BACKFILL_ORCHESTRATOR_ROUTE_PATH,
  BACKFILL_PHASE_ORDER,
  BACKFILL_STATE_KV_KEY,
} from 'src/constants/backfill';
import { BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { postToOwnRoute } from 'src/utils/post-to-own-route';

// Seeds the backfill lock at the first phase and hands off to the orchestrator,
// which walks every record in small batches while keeping updates sequential.
const handler = async (): Promise<void> => {
  await kv.set<BackfillState>(BACKFILL_STATE_KV_KEY, {
    phase: BACKFILL_PHASE_ORDER[0],
    cursor: null,
  });

  await postToOwnRoute({ path: BACKFILL_ORCHESTRATOR_ROUTE_PATH, body: {} });
};

export default definePostInstallLogicFunction({
  universalIdentifier: BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-last-contact',
  description:
    'Starts the sequential last-contact backfill orchestrator after installation.',
  timeoutSeconds: 60,
  shouldRunOnVersionUpgrade: true,
  handler,
});
