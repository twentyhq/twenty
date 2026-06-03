import assert from 'node:assert/strict';

import {
  createVisitSyncQueueItem,
  discardMobileSyncQueueItem,
  markVisitSyncQueueItemPending,
  reconcileVisitSyncQueueWithServerResponse,
  retryMobileSyncQueueItem,
  resolveVisitSyncQueue,
  type ShahryarMobileVisitDraft,
} from '../mobileSyncQueue';

const baseDraft: ShahryarMobileVisitDraft = {
  localId: 'local-visit-1',
  serverId: 'server-visit-1',
  assignedMarketId: 'market-1',
  supervisorId: 'supervisor-1',
  checkInAt: '2026-06-01T09:00:00.000Z',
  gpsLocation: {
    latitude: 36.191,
    longitude: 44.009,
  },
  photoLocalUris: ['file:///visit-photo.jpg'],
  photoFileIds: ['file-existing-1'],
  soldCartons: 12,
  requestedCartons: 4,
  issue: 'قەرز ماوە',
  decisionMaker: 'ئەدمین',
  requestDetails: '4 کارتۆن',
  report: 'سەردان تۆمار کرا',
  updatedAt: '2026-06-01T09:30:00.000Z',
};

const queueItem = createVisitSyncQueueItem({
  draft: baseDraft,
  now: '2026-06-01T09:31:00.000Z',
});

assert.equal(queueItem.status, 'pending');
assert.equal(queueItem.localId, baseDraft.localId);
assert.equal(queueItem.draft.photoLocalUris.length, 1);

const updatedQueueItem = markVisitSyncQueueItemPending({
  item: {
    ...queueItem,
    status: 'conflict',
    conflict: {
      localId: queueItem.localId,
      serverId: 'server-visit-1',
      recordKind: 'visit',
      reason: 'server-newer',
      localUpdatedAt: '2026-06-01T09:30:00.000Z',
      serverUpdatedAt: '2026-06-01T09:40:00.000Z',
    },
  },
  draft: {
    ...baseDraft,
    report: 'چارەسەری ناکۆکی کرا',
    updatedAt: '2026-06-01T09:45:00.000Z',
  },
  now: '2026-06-01T09:46:00.000Z',
});

assert.equal(updatedQueueItem.status, 'pending');
assert.equal(updatedQueueItem.conflict, undefined);

const pushResolution = resolveVisitSyncQueue({
  queue: [updatedQueueItem],
  serverVisits: [
    {
      id: 'server-visit-1',
      updatedAt: '2026-06-01T09:40:00.000Z',
    },
  ],
});

assert.equal(pushResolution.itemsToPush.length, 1);
assert.equal(pushResolution.conflicts.length, 0);

const conflictResolution = resolveVisitSyncQueue({
  queue: [queueItem],
  serverVisits: [
    {
      id: 'server-visit-1',
      updatedAt: '2026-06-01T09:40:00.000Z',
    },
  ],
});

assert.equal(conflictResolution.itemsToPush.length, 0);
assert.equal(conflictResolution.itemsToKeepLocal.length, 1);
assert.equal(conflictResolution.conflicts.length, 1);
assert.deepEqual(conflictResolution.conflicts[0], {
  localId: 'local-visit-1',
  serverId: 'server-visit-1',
  recordKind: 'visit',
  reason: 'server-newer',
  localUpdatedAt: '2026-06-01T09:30:00.000Z',
  serverUpdatedAt: '2026-06-01T09:40:00.000Z',
});

const rejectedQueueItem = createVisitSyncQueueItem({
  draft: {
    ...baseDraft,
    localId: 'local-visit-2',
    serverId: undefined,
    soldCartons: -1,
  },
  now: '2026-06-01T09:32:00.000Z',
});
const conflictQueueItem = createVisitSyncQueueItem({
  draft: {
    ...baseDraft,
    localId: 'local-visit-3',
  },
  now: '2026-06-01T09:33:00.000Z',
});
const reconciliation = reconcileVisitSyncQueueWithServerResponse({
  queue: [updatedQueueItem, conflictQueueItem, rejectedQueueItem],
  response: {
    deviceId: 'device-1',
    nextPullCursor: '2026-06-01T10:00:00.000Z',
    acceptedChanges: [
      {
        localId: updatedQueueItem.localId,
        recordKind: 'visit',
        serverId: 'server-visit-1',
        operation: 'update',
        acceptedAt: '2026-06-01T10:00:00.000Z',
      },
    ],
    conflicts: [
      {
        localId: conflictQueueItem.localId,
        serverId: 'server-visit-1',
        recordKind: 'visit',
        reason: 'server-newer',
        clientUpdatedAt: '2026-06-01T09:30:00.000Z',
        serverUpdatedAt: '2026-06-01T09:40:00.000Z',
      },
    ],
    rejectedChanges: [
      {
        localId: rejectedQueueItem.localId,
        recordKind: 'visit',
        reason: 'invalid-carton-count',
      },
    ],
  },
});

assert.deepEqual(reconciliation.acceptedLocalIds, ['local-visit-1']);
assert.deepEqual(reconciliation.conflictedLocalIds, ['local-visit-3']);
assert.deepEqual(reconciliation.rejectedLocalIds, ['local-visit-2']);
assert.equal(reconciliation.queue[0].status, 'synced');
assert.equal(reconciliation.queue[0].lastSyncedAt, '2026-06-01T10:00:00.000Z');
assert.equal(reconciliation.queue[1].status, 'conflict');
assert.equal(
  reconciliation.queue[1].conflict?.serverUpdatedAt,
  '2026-06-01T09:40:00.000Z',
);
assert.equal(reconciliation.queue[2].status, 'rejected');
assert.equal(reconciliation.queue[2].rejection?.reason, 'invalid-carton-count');

const retriedQueueItem = retryMobileSyncQueueItem({
  item: reconciliation.queue[1],
  now: '2026-06-01T10:05:00.000Z',
});

assert.equal(retriedQueueItem.status, 'pending');
assert.equal(retriedQueueItem.conflict, undefined);

const discardedQueueItem = discardMobileSyncQueueItem({
  item: reconciliation.queue[2],
  now: '2026-06-01T10:06:00.000Z',
});

assert.equal(discardedQueueItem.status, 'discarded');
assert.equal(discardedQueueItem.rejection, undefined);

console.log('mobileSyncQueue tests passed');
