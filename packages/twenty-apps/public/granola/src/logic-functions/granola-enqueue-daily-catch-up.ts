import { defineLogicFunction } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import {
  GRANOLA_DAILY_CATCH_UP_UNIVERSAL_IDENTIFIER,
  GRANOLA_ENQUEUE_DAILY_CATCH_UP_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { computeWorkspaceDistributionDelay } from 'src/logic-functions/utils/compute-workspace-distribution-delay.util';
import { enqueueGranolaJobOrThrow } from 'src/logic-functions/utils/enqueue-granola-job-or-throw.util';
import { findGranolaRegistrationForCurrentKey } from 'src/logic-functions/utils/find-granola-registration-for-current-key.util';
import { getGranolaJobId } from 'src/logic-functions/utils/get-granola-job-id.util';

export const granolaEnqueueDailyCatchUpHandler = async (
  _payload: unknown,
  { workspaceId }: LogicFunctionExecutionContext,
) => {
  if (!isDefined(await findGranolaRegistrationForCurrentKey())) {
    return { success: true, skipped: true };
  }

  const delayMs = computeWorkspaceDistributionDelay(workspaceId);

  await enqueueGranolaJobOrThrow({
    logicFunctionUniversalIdentifier:
      GRANOLA_DAILY_CATCH_UP_UNIVERSAL_IDENTIFIER,
    payload: {},
    jobId: getGranolaJobId({
      prefix: 'granola-daily-catch-up',
      identity: { runDay: new Date().toISOString().slice(0, 10) },
    }),
    delayMs,
  });

  return { success: true, delayMs };
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_ENQUEUE_DAILY_CATCH_UP_UNIVERSAL_IDENTIFIER,
  name: 'granola-enqueue-daily-catch-up',
  description:
    'Schedules the daily Granola catch-up at a stable workspace-specific delay to spread Twenty API traffic.',
  timeoutSeconds: 30,
  handler: granolaEnqueueDailyCatchUpHandler,
  cronTriggerSettings: { pattern: '0 4 * * *' },
});
