import { defineLogicFunction } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import {
  GRANOLA_CATCH_UP_WINDOW_DAYS,
  GRANOLA_MILLISECONDS_PER_DAY,
} from 'src/constants/granola-history.constant';
import { GRANOLA_DAILY_CATCH_UP_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { enqueueGranolaBackfillOrThrow } from 'src/logic-functions/utils/enqueue-granola-backfill-or-throw.util';
import { enqueueGranolaInitialBackfillOrThrow } from 'src/logic-functions/utils/enqueue-granola-initial-backfill-or-throw.util';
import { findGranolaRegistrationForCurrentKey } from 'src/logic-functions/utils/find-granola-registration-for-current-key.util';
import { reconcileGranolaFolderSelectionOrThrow } from 'src/logic-functions/utils/reconcile-granola-folder-selection-or-throw.util';

export const granolaDailyCatchUpHandler = async () => {
  const registration = await findGranolaRegistrationForCurrentKey();

  if (!isDefined(registration)) {
    return { success: true, skipped: true };
  }

  await reconcileGranolaFolderSelectionOrThrow();
  await enqueueGranolaInitialBackfillOrThrow();
  const result = await enqueueGranolaBackfillOrThrow({
    updatedAfter: new Date(
      Date.now() - GRANOLA_CATCH_UP_WINDOW_DAYS * GRANOLA_MILLISECONDS_PER_DAY,
    ).toISOString(),
  });

  return { success: true, ...result };
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_DAILY_CATCH_UP_UNIVERSAL_IDENTIFIER,
  name: 'granola-daily-catch-up',
  description:
    'Imports Granola notes updated during the last two days to recover missed webhook deliveries.',
  timeoutSeconds: 120,
  handler: granolaDailyCatchUpHandler,
  cronTriggerSettings: { pattern: '0 4 * * *' },
});
