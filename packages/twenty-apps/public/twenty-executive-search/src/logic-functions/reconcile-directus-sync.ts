import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { RECONCILE_DIRECTUS_SYNC_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/reconcile-directus-sync-logic-function-universal-identifier';
import { getDirectusApiConfig } from 'src/logic-functions/directus-api/get-directus-api-config.util';

const TIMEOUT_SECONDS = 900;
const CONTINUATION_RESERVE_MS = 30_000;

// R2 gate: this reconciliation function NEVER writes to business records.
// It records a run in the reconciliation ledger with summary findings.

export const reconcileDirectusSyncHandler =
  async (): Promise<object> => {
    const startedAt = new Date().toISOString();
    const client = new CoreApiClient();

    // Gracefully handle Directus-unavailable: record a no-op run.
    const configResult = getDirectusApiConfig();

    const runResult = await client.mutation({
      createExternalSyncReconciliationRun: {
        __args: {
          data: {
            scope: 'full',
            status: configResult.success ? 'STARTED' : 'SKIPPED',
            startedAt,
          },
        },
        id: true,
      },
    });

    if (!configResult.success) {
      // Record a finished no-op run.
      await client.mutation({
        updateExternalSyncReconciliationRun: {
          __args: {
            id: runResult.createExternalSyncReconciliationRun?.id ?? '',
            data: {
              status: 'SKIPPED',
              finishedAt: new Date().toISOString(),
              summary: JSON.stringify({
                reason: configResult.reason,
                collections: [],
                findingsCount: 0,
              }),
            },
          },
          id: true,
        },
      });

      return {
        outcome: 'skipped',
        reason: configResult.reason,
        reconciliationRunId:
          runResult.createExternalSyncReconciliationRun?.id,
      };
    }

    // Self-continuation + deadline pattern for future batch processing.
    const deadlineAtMs =
      Date.now() + TIMEOUT_SECONDS * 1000 - CONTINUATION_RESERVE_MS;

    // ------------------------------------------------------------------
    // In PR4, this section will enumerate sync checkpoints, compare
    // Directus and Twenty records, and write findings to the
    // ExternalSyncReconciliationFinding object. For now (R2 gate) the
    // function only records that a reconciliation run STARTED.
    // ------------------------------------------------------------------

    const findingsCount = 0;

    await client.mutation({
      updateExternalSyncReconciliationRun: {
        __args: {
          id: runResult.createExternalSyncReconciliationRun?.id ?? '',
          data: {
            status: 'COMPLETED',
            finishedAt: new Date().toISOString(),
            summary: JSON.stringify({
              collections: [],
              findingsCount,
              deadlineAt: new Date(deadlineAtMs).toISOString(),
            }),
          },
        },
        id: true,
      },
    });

    return {
      outcome: 'completed',
      reconciliationRunId:
        runResult.createExternalSyncReconciliationRun?.id,
      deadlineAt: new Date(deadlineAtMs).toISOString(),
    };
  };

export default defineLogicFunction({
  universalIdentifier:
    RECONCILE_DIRECTUS_SYNC_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-directus-sync',
  description:
    'Periodic reconciliation between Directus and Twenty executive records. Creates reconciliation run records with findings; never writes to business records (R2 gate).',
  timeoutSeconds: TIMEOUT_SECONDS,
  handler: reconcileDirectusSyncHandler,
  cronTriggerSettings: {
    pattern: '*/15 * * * *',
  },
});
