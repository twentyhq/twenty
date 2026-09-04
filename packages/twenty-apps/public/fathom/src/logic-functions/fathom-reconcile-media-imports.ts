import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';
import { z } from 'zod';
import { isDefined } from 'src/utils/is-defined';

import {
  FATHOM_HEALING_WINDOW_DAYS,
  FATHOM_MEDIA_RECONCILIATION_CRON_PATTERN,
  FATHOM_MEDIA_RECONCILIATION_GRACE_PERIOD_MILLISECONDS,
  MILLISECONDS_PER_DAY,
} from 'src/constants/fathom.constant';
import { FATHOM_RECONCILE_MEDIA_IMPORTS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type FathomMediaReconciliationRun } from 'src/logic-functions/types/fathom-media-reconciliation-plan.type';
import { buildRetryableFathomError } from 'src/logic-functions/utils/build-retryable-fathom-error.util';
import { cleanupDisconnectedFathomMediaImports } from 'src/logic-functions/utils/cleanup-disconnected-fathom-media-imports.util';
import { enqueueFathomJobsOrThrow } from 'src/logic-functions/utils/enqueue-fathom-jobs-or-throw.util';
import { reconcileFathomMediaImports } from 'src/logic-functions/utils/reconcile-fathom-media-imports.util';

const FATHOM_MEDIA_RECONCILIATION_CHECKPOINT_KEY =
  'fathom:media-reconciliation:checkpoint';

const fathomMediaReconciliationRunSchema = z.object({
  startedAfter: z.string().datetime(),
  staleBefore: z.string().datetime(),
  afterId: z.string().uuid().optional(),
});

const fathomMediaReconciliationPayloadSchema = z.object({
  disconnectedAccountId: z.string().uuid().optional(),
  recoveryRun: fathomMediaReconciliationRunSchema.optional(),
});

const buildFathomMediaReconciliationRun = (
  now: Date,
): FathomMediaReconciliationRun => ({
  startedAfter: new Date(
    now.getTime() - FATHOM_HEALING_WINDOW_DAYS * MILLISECONDS_PER_DAY,
  ).toISOString(),
  staleBefore: new Date(
    now.getTime() - FATHOM_MEDIA_RECONCILIATION_GRACE_PERIOD_MILLISECONDS,
  ).toISOString(),
});

export const fathomReconcileMediaImportsHandler = async (payload: unknown) => {
  const payloadParseResult = fathomMediaReconciliationPayloadSchema.safeParse(
    payload ?? {},
  );

  if (!payloadParseResult.success) {
    throw new Error('Fathom media reconciliation requires a valid payload');
  }

  if (
    isDefined(payloadParseResult.data.disconnectedAccountId) &&
    isDefined(payloadParseResult.data.recoveryRun)
  ) {
    throw new Error('Fathom media reconciliation payload is ambiguous');
  }

  try {
    const coreApiClient = new CoreApiClient({ runAs: 'application' });
    const { disconnectedAccountId } = payloadParseResult.data;

    if (isDefined(disconnectedAccountId)) {
      const result = await cleanupDisconnectedFathomMediaImports({
        coreApiClient,
        connectedAccountId: disconnectedAccountId,
      });

      if (result.shouldContinue) {
        await enqueueFathomJobsOrThrow({
          logicFunctionUniversalIdentifier:
            FATHOM_RECONCILE_MEDIA_IMPORTS_UNIVERSAL_IDENTIFIER,
          payloads: [{ disconnectedAccountId }],
        });
      }

      return result;
    }

    const storedRunParseResult = fathomMediaReconciliationRunSchema.safeParse(
      await kv.get<unknown>(FATHOM_MEDIA_RECONCILIATION_CHECKPOINT_KEY),
    );
    const run =
      payloadParseResult.data.recoveryRun ??
      (storedRunParseResult.success
        ? storedRunParseResult.data
        : buildFathomMediaReconciliationRun(new Date()));
    const result = await reconcileFathomMediaImports({ coreApiClient, run });

    if (result.disconnectedAccountIds.length > 0) {
      await enqueueFathomJobsOrThrow({
        logicFunctionUniversalIdentifier:
          FATHOM_RECONCILE_MEDIA_IMPORTS_UNIVERSAL_IDENTIFIER,
        payloads: result.disconnectedAccountIds.map((accountId) => ({
          disconnectedAccountId: accountId,
        })),
      });
    }

    if (result.hasNextPage && isDefined(result.nextAfterId)) {
      const nextRun = {
        ...run,
        afterId: result.nextAfterId,
      };

      await kv.set(FATHOM_MEDIA_RECONCILIATION_CHECKPOINT_KEY, nextRun);
      await enqueueFathomJobsOrThrow({
        logicFunctionUniversalIdentifier:
          FATHOM_RECONCILE_MEDIA_IMPORTS_UNIVERSAL_IDENTIFIER,
        payloads: [{ recoveryRun: nextRun }],
      });
    } else {
      await kv.delete(FATHOM_MEDIA_RECONCILIATION_CHECKPOINT_KEY);
    }

    return result;
  } catch (error) {
    throw buildRetryableFathomError({
      operation: 'media import reconciliation',
      error,
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_RECONCILE_MEDIA_IMPORTS_UNIVERSAL_IDENTIFIER,
  name: 'fathom-reconcile-media-imports',
  description:
    'Recovers unfinished local Fathom media imports and settles imports for disconnected accounts.',
  timeoutSeconds: 300,
  handler: fathomReconcileMediaImportsHandler,
  cronTriggerSettings: {
    pattern: FATHOM_MEDIA_RECONCILIATION_CRON_PATTERN,
  },
});
