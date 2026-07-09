import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  MIGRATION_ITEM_STATUS,
  MIGRATION_STATUS,
} from 'src/constants/migration-status';
import { getMigrationObjectDefinition } from 'src/logic-functions/migration/migration-object-definitions';
import {
  type MigrationItemRecord,
  type MigrationRecord,
} from 'src/logic-functions/migration/migration-types';
import { processItemBatch } from 'src/logic-functions/migration/process-item-batch';
import { storeMigrationErrors } from 'src/logic-functions/migration/twenty-records';
import { SalesforceClient } from 'src/logic-functions/salesforce/salesforce-client';
import {
  getErrorMessage,
  SalesforceAuthError,
  SalesforceConfigError,
} from 'src/logic-functions/salesforce/salesforce-errors';

const DEFAULT_BATCH_SIZE = 200;
const DEFAULT_ERROR_RECORD_LIMIT = 500;
const MAX_BATCH_RETRIES = 5;
const HEARTBEAT_STALE_MS = 50_000;

const getBatchSize = (): number => {
  const parsed = Number(process.env.MIGRATION_BATCH_SIZE);

  return Number.isFinite(parsed) && parsed >= 1 && parsed <= 2_000
    ? Math.floor(parsed)
    : DEFAULT_BATCH_SIZE;
};

const getErrorRecordLimit = (): number => {
  const parsed = Number(process.env.MIGRATION_ERROR_RECORD_LIMIT);

  return Number.isFinite(parsed) && parsed >= 0
    ? Math.floor(parsed)
    : DEFAULT_ERROR_RECORD_LIMIT;
};

const MIGRATION_SELECTION = {
  id: true,
  name: true,
  status: true,
  totalRecords: true,
  processedRecords: true,
  createdRecords: true,
  updatedRecords: true,
  failedRecords: true,
  heartbeatAt: true,
  salesforceOrgId: true,
  plan: true,
} as const;

const ITEM_SELECTION = {
  id: true,
  name: true,
  status: true,
  salesforceObject: true,
  processingOrder: true,
  recordCount: true,
  processedCount: true,
  createdCount: true,
  updatedCount: true,
  failedCount: true,
  lastProcessedId: true,
  batchRetryCount: true,
} as const;

const fetchRunningMigration = async (
  client: CoreApiClient,
): Promise<MigrationRecord | null> => {
  const response = await client.query({
    salesforceMigrations: {
      __args: {
        filter: { status: { eq: MIGRATION_STATUS.RUNNING } },
        orderBy: [{ createdAt: 'AscNullsLast' }],
        first: 1,
      },
      edges: { node: MIGRATION_SELECTION },
    },
  });

  const node = (response as Record<string, any>).salesforceMigrations
    ?.edges?.[0]?.node;

  return (node as MigrationRecord | undefined) ?? null;
};

const fetchMigrationItems = async (
  client: CoreApiClient,
  migrationId: string,
): Promise<MigrationItemRecord[]> => {
  const response = await client.query({
    salesforceMigrationItems: {
      __args: {
        filter: { migrationId: { eq: migrationId } },
        orderBy: [{ processingOrder: 'AscNullsLast' }],
        first: 50,
      },
      edges: { node: ITEM_SELECTION },
    },
  });

  const edges =
    (response as Record<string, any>).salesforceMigrationItems?.edges ?? [];

  return edges.map((edge: { node: MigrationItemRecord }) => edge.node);
};

const updateMigration = async (
  client: CoreApiClient,
  migrationId: string,
  data: Record<string, unknown>,
): Promise<void> => {
  await client.mutation({
    updateSalesforceMigration: {
      __args: { id: migrationId, data },
      id: true,
    },
  });
};

const updateMigrationItem = async (
  client: CoreApiClient,
  itemId: string,
  data: Record<string, unknown>,
): Promise<void> => {
  await client.mutation({
    updateSalesforceMigrationItem: {
      __args: { id: itemId, data },
      id: true,
    },
  });
};

const isHeartbeatFresh = (heartbeatAt: string | null): boolean => {
  if (heartbeatAt === null) {
    return false;
  }

  const heartbeatTime = new Date(heartbeatAt).getTime();

  return (
    Number.isFinite(heartbeatTime) &&
    Date.now() - heartbeatTime < HEARTBEAT_STALE_MS
  );
};

const finalizeMigration = async (
  client: CoreApiClient,
  migration: MigrationRecord,
  items: MigrationItemRecord[],
): Promise<void> => {
  const hasFailedItems = items.some(
    (item) => item.status === MIGRATION_ITEM_STATUS.FAILED,
  );
  const hasRecordFailures = items.some((item) => (item.failedCount ?? 0) > 0);

  await updateMigration(client, migration.id, {
    status:
      hasFailedItems || hasRecordFailures
        ? MIGRATION_STATUS.COMPLETED_WITH_ERRORS
        : MIGRATION_STATUS.COMPLETED,
    completedAt: new Date().toISOString(),
  });
};

export type MigrationTickSummary = {
  // 'progressed' means work remains and the caller should chain another tick;
  // 'stalled' means a transient error occurred and the watchdog should retry
  // later instead of hot-looping.
  outcome:
    | 'no-running-migration'
    | 'heartbeat-fresh'
    | 'progressed'
    | 'stalled'
    | 'completed'
    | 'failed';
  migrationId?: string;
  processedInTick?: number;
};

// One worker pass over the running migration, bounded by a time budget so it
// finishes well inside the function timeout. Batches are idempotent (upsert by
// salesforceId with an Id watermark), so an interrupted or duplicated tick can
// never corrupt data.
export const runMigrationTick = async ({
  timeBudgetMs,
  ignoreFreshHeartbeat = false,
}: {
  timeBudgetMs: number;
  ignoreFreshHeartbeat?: boolean;
}): Promise<MigrationTickSummary> => {
  const startedAt = Date.now();
  const client = new CoreApiClient();
  const migration = await fetchRunningMigration(client);

  if (migration === null) {
    return { outcome: 'no-running-migration' };
  }

  if (!ignoreFreshHeartbeat && isHeartbeatFresh(migration.heartbeatAt)) {
    return { outcome: 'heartbeat-fresh', migrationId: migration.id };
  }

  const batchSize = getBatchSize();
  const errorRecordLimit = getErrorRecordLimit();
  const mappingContext = {
    currencyIsoCode: migration.plan?.currencyIsoCode ?? 'USD',
  };

  let salesforceClient: SalesforceClient;

  try {
    salesforceClient = new SalesforceClient();
  } catch (error) {
    await updateMigration(client, migration.id, {
      status: MIGRATION_STATUS.FAILED,
      lastError: getErrorMessage(error),
    });

    return { outcome: 'failed', migrationId: migration.id };
  }

  let processedInTick = 0;
  let migrationProcessed = migration.processedRecords ?? 0;
  let migrationCreated = migration.createdRecords ?? 0;
  let migrationUpdated = migration.updatedRecords ?? 0;
  let migrationFailed = migration.failedRecords ?? 0;

  while (Date.now() - startedAt < timeBudgetMs) {
    await updateMigration(client, migration.id, {
      heartbeatAt: new Date().toISOString(),
    });

    const items = await fetchMigrationItems(client, migration.id);
    const currentItem = items.find(
      (item) =>
        item.status === MIGRATION_ITEM_STATUS.PENDING ||
        item.status === MIGRATION_ITEM_STATUS.RUNNING,
    );

    if (currentItem === undefined) {
      await finalizeMigration(client, migration, items);

      return {
        outcome: 'completed',
        migrationId: migration.id,
        processedInTick,
      };
    }

    const definition = getMigrationObjectDefinition(
      currentItem.salesforceObject.toLowerCase(),
    );

    if (definition === undefined) {
      await updateMigrationItem(client, currentItem.id, {
        status: MIGRATION_ITEM_STATUS.FAILED,
        lastError: `Unknown migration object: ${currentItem.salesforceObject}`,
      });
      continue;
    }

    if (currentItem.status === MIGRATION_ITEM_STATUS.PENDING) {
      await updateMigrationItem(client, currentItem.id, {
        status: MIGRATION_ITEM_STATUS.RUNNING,
      });
    }

    try {
      const batchResult = await processItemBatch({
        client,
        salesforceClient,
        definition,
        lastProcessedId: currentItem.lastProcessedId,
        batchSize,
        mappingContext,
      });

      const itemProcessed =
        (currentItem.processedCount ?? 0) + batchResult.fetched;
      const itemFailed = (currentItem.failedCount ?? 0) + batchResult.failed;
      const itemIsDone = batchResult.fetched < batchSize;

      await updateMigrationItem(client, currentItem.id, {
        processedCount: itemProcessed,
        createdCount: (currentItem.createdCount ?? 0) + batchResult.created,
        updatedCount: (currentItem.updatedCount ?? 0) + batchResult.updated,
        failedCount: itemFailed,
        lastProcessedId: batchResult.lastProcessedId,
        batchRetryCount: 0,
        ...(itemIsDone
          ? {
              status:
                itemFailed > 0
                  ? MIGRATION_ITEM_STATUS.COMPLETED_WITH_ERRORS
                  : MIGRATION_ITEM_STATUS.COMPLETED,
            }
          : {}),
      });

      migrationProcessed += batchResult.fetched;
      migrationCreated += batchResult.created;
      migrationUpdated += batchResult.updated;
      migrationFailed += batchResult.failed;
      processedInTick += batchResult.fetched;

      await updateMigration(client, migration.id, {
        processedRecords: migrationProcessed,
        createdRecords: migrationCreated,
        updatedRecords: migrationUpdated,
        failedRecords: migrationFailed,
      });

      await storeMigrationErrors({
        client,
        migrationId: migration.id,
        failures: batchResult.failures,
        capacity: errorRecordLimit - (migrationFailed - batchResult.failed),
      });
    } catch (error) {
      if (
        error instanceof SalesforceAuthError ||
        error instanceof SalesforceConfigError
      ) {
        await updateMigration(client, migration.id, {
          status: MIGRATION_STATUS.FAILED,
          lastError: getErrorMessage(error),
        });

        return { outcome: 'failed', migrationId: migration.id };
      }

      const batchRetryCount = (currentItem.batchRetryCount ?? 0) + 1;
      const itemHasFailed = batchRetryCount >= MAX_BATCH_RETRIES;

      await updateMigrationItem(client, currentItem.id, {
        batchRetryCount,
        lastError: getErrorMessage(error),
        ...(itemHasFailed ? { status: MIGRATION_ITEM_STATUS.FAILED } : {}),
      });

      if (!itemHasFailed) {
        // Transient failure: stop this tick and let the watchdog retry later.
        return {
          outcome: 'stalled',
          migrationId: migration.id,
          processedInTick,
        };
      }
    }
  }

  return { outcome: 'progressed', migrationId: migration.id, processedInTick };
};
