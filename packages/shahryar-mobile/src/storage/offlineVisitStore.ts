import * as SQLite from 'expo-sqlite';

import {
  type ShahryarMobileRecordDraft,
  type ShahryarMobileSyncQueueItem,
  type ShahryarMobileSyncResponse,
  type ShahryarMobileVisitDraft,
  createMobileSyncQueueItem,
  createVisitSyncQueueItem,
  discardMobileSyncQueueItem,
  reconcileVisitSyncQueueWithServerResponse,
  retryMobileSyncQueueItem,
} from '../sync/mobileSyncQueue';

const DATABASE_NAME = 'shahryar-ops.db';
const OFFLINE_SYNC_QUEUE_TABLE_NAME = 'offline_sync_queue';

type OfflineVisitRow = {
  localId: string;
  payload: string;
};

export const openOfflineVisitDatabase = async () => {
  const database = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS ${OFFLINE_SYNC_QUEUE_TABLE_NAME} (
      localId TEXT PRIMARY KEY NOT NULL,
      payload TEXT NOT NULL
    );
  `);

  return database;
};

export const saveOfflineRecordDraft = async ({
  draft,
  now,
}: {
  draft: ShahryarMobileRecordDraft;
  now: string;
}) => {
  const database = await openOfflineVisitDatabase();
  const queueItem = createMobileSyncQueueItem({ draft, now });

  await database.runAsync(
    `INSERT OR REPLACE INTO ${OFFLINE_SYNC_QUEUE_TABLE_NAME} (localId, payload)
     VALUES (?, ?);`,
    queueItem.localId,
    JSON.stringify(queueItem),
  );

  return queueItem;
};

export const saveOfflineVisitDraft = async ({
  draft,
  now,
}: {
  draft: ShahryarMobileVisitDraft;
  now: string;
}) => {
  const database = await openOfflineVisitDatabase();
  const queueItem = createVisitSyncQueueItem({ draft, now });

  await database.runAsync(
    `INSERT OR REPLACE INTO ${OFFLINE_SYNC_QUEUE_TABLE_NAME} (localId, payload)
     VALUES (?, ?);`,
    queueItem.localId,
    JSON.stringify(queueItem),
  );

  return queueItem;
};

export const loadOfflineSyncQueue = async (): Promise<
  ShahryarMobileSyncQueueItem[]
> => {
  const database = await openOfflineVisitDatabase();
  const rows = await database.getAllAsync<OfflineVisitRow>(
    `SELECT localId, payload FROM ${OFFLINE_SYNC_QUEUE_TABLE_NAME} ORDER BY localId;`,
  );

  return rows.map(
    (row: OfflineVisitRow) =>
      JSON.parse(row.payload) as ShahryarMobileSyncQueueItem,
  );
};

export const loadOfflineVisitQueue = loadOfflineSyncQueue;

export const replaceOfflineSyncQueue = async ({
  queue,
}: {
  queue: ShahryarMobileSyncQueueItem[];
}) => {
  const database = await openOfflineVisitDatabase();

  await database.withTransactionAsync(async () => {
    await database.runAsync(`DELETE FROM ${OFFLINE_SYNC_QUEUE_TABLE_NAME};`);

    for (const item of queue) {
      await database.runAsync(
        `INSERT INTO ${OFFLINE_SYNC_QUEUE_TABLE_NAME} (localId, payload)
         VALUES (?, ?);`,
        item.localId,
        JSON.stringify(item),
      );
    }
  });
};

export const replaceOfflineVisitQueue = replaceOfflineSyncQueue;

export const applyOfflineVisitSyncResponse = async ({
  response,
}: {
  response: ShahryarMobileSyncResponse;
}) => {
  const queue = await loadOfflineSyncQueue();
  const reconciliation = reconcileVisitSyncQueueWithServerResponse({
    queue,
    response,
  });

  await replaceOfflineSyncQueue({ queue: reconciliation.queue });

  return reconciliation;
};

export const retryOfflineSyncQueueItem = async ({
  localId,
  now,
}: {
  localId: string;
  now: string;
}) => {
  const queue = await loadOfflineSyncQueue();
  const nextQueue = queue.map((item) =>
    item.localId === localId ? retryMobileSyncQueueItem({ item, now }) : item,
  );

  await replaceOfflineSyncQueue({ queue: nextQueue });

  return nextQueue;
};

export const discardOfflineSyncQueueItem = async ({
  localId,
  now,
}: {
  localId: string;
  now: string;
}) => {
  const queue = await loadOfflineSyncQueue();
  const nextQueue = queue.map((item) =>
    item.localId === localId ? discardMobileSyncQueueItem({ item, now }) : item,
  );

  await replaceOfflineSyncQueue({ queue: nextQueue });

  return nextQueue;
};
