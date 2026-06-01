import * as SQLite from 'expo-sqlite';

import {
  type ShahryarMobileSyncQueueItem,
  type ShahryarMobileSyncResponse,
  type ShahryarMobileVisitDraft,
  createVisitSyncQueueItem,
  reconcileVisitSyncQueueWithServerResponse,
} from '../sync/mobileSyncQueue';

const DATABASE_NAME = 'shahryar-ops.db';

type OfflineVisitRow = {
  localId: string;
  payload: string;
};

export const openOfflineVisitDatabase = async () => {
  const database = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS offline_visit_queue (
      localId TEXT PRIMARY KEY NOT NULL,
      payload TEXT NOT NULL
    );
  `);

  return database;
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
    `INSERT OR REPLACE INTO offline_visit_queue (localId, payload)
     VALUES (?, ?);`,
    queueItem.localId,
    JSON.stringify(queueItem),
  );

  return queueItem;
};

export const loadOfflineVisitQueue = async (): Promise<
  ShahryarMobileSyncQueueItem[]
> => {
  const database = await openOfflineVisitDatabase();
  const rows = await database.getAllAsync<OfflineVisitRow>(
    'SELECT localId, payload FROM offline_visit_queue ORDER BY localId;',
  );

  return rows.map(
    (row: OfflineVisitRow) =>
      JSON.parse(row.payload) as ShahryarMobileSyncQueueItem,
  );
};

export const replaceOfflineVisitQueue = async ({
  queue,
}: {
  queue: ShahryarMobileSyncQueueItem[];
}) => {
  const database = await openOfflineVisitDatabase();

  await database.withTransactionAsync(async () => {
    await database.runAsync('DELETE FROM offline_visit_queue;');

    for (const item of queue) {
      await database.runAsync(
        `INSERT INTO offline_visit_queue (localId, payload)
         VALUES (?, ?);`,
        item.localId,
        JSON.stringify(item),
      );
    }
  });
};

export const applyOfflineVisitSyncResponse = async ({
  response,
}: {
  response: ShahryarMobileSyncResponse;
}) => {
  const queue = await loadOfflineVisitQueue();
  const reconciliation = reconcileVisitSyncQueueWithServerResponse({
    queue,
    response,
  });

  await replaceOfflineVisitQueue({ queue: reconciliation.queue });

  return reconciliation;
};
