import assert from 'node:assert/strict';

import { createVisitSyncQueueItem } from '../../sync/mobileSyncQueue';
import {
  associateShahryarMobilePhoto,
  buildMobileSyncRequest,
  buildVisitSyncChangeFromQueueItem,
  pullShahryarMobileSyncData,
  registerShahryarMobileNotifications,
  signInShahryarMobile,
  syncOfflineVisitQueue,
} from '../shahryarMobileApi';

const draft = {
  localId: 'local-visit-1',
  serverId: 'server-visit-1',
  assignedMarketId: 'market-1',
  supervisorId: 'supervisor-1',
  checkInAt: '2026-06-01T09:00:00.000Z',
  gpsLocation: {
    latitude: 36.191,
    longitude: 44.009,
  },
  photoLocalUris: ['file:///photo.jpg'],
  photoFileIds: ['file-existing-1'],
  soldCartons: 12,
  requestedCartons: 4,
  issue: 'Late payment',
  decisionMaker: 'Store owner',
  requestDetails: 'Four cartons requested',
  report: 'Visit completed',
  updatedAt: '2026-06-01T09:30:00.000Z',
};

const pendingQueueItem = {
  ...createVisitSyncQueueItem({
    draft,
    now: '2026-06-01T09:31:00.000Z',
  }),
  lastSyncedAt: '2026-06-01T09:10:00.000Z',
};
const paymentQueueItem = {
  localId: 'local-payment-1',
  recordKind: 'payment',
  status: 'pending',
  draft: {
    recordKind: 'payment',
    localId: 'local-payment-1',
    marketId: 'market-1',
    collectedById: 'supervisor-1',
    amount: 250,
    paidAt: '2026-06-01',
    status: 'PARTIAL',
    notes: 'Partial payment',
    updatedAt: '2026-06-01T09:35:00.000Z',
  },
  createdAt: '2026-06-01T09:35:00.000Z',
  updatedAt: '2026-06-01T09:35:00.000Z',
} as const;

const syncChange = buildVisitSyncChangeFromQueueItem(pendingQueueItem);

assert.deepEqual(syncChange, {
  recordKind: 'visit',
  localId: 'local-visit-1',
  serverId: 'server-visit-1',
  operation: 'update',
  assignedMarketId: 'market-1',
  supervisorId: 'supervisor-1',
  checkInAt: '2026-06-01T09:00:00.000Z',
  gpsLocation: {
    latitude: 36.191,
    longitude: 44.009,
  },
  photoFileIds: ['file-existing-1'],
  soldCartons: 12,
  requestedCartons: 4,
  issue: 'Late payment',
  decisionMaker: 'Store owner',
  requestDetails: 'Four cartons requested',
  report: 'Visit completed',
  baseServerUpdatedAt: '2026-06-01T09:10:00.000Z',
  clientUpdatedAt: '2026-06-01T09:30:00.000Z',
});

const request = buildMobileSyncRequest({
  deviceId: 'ios-device-1',
  queue: [
    pendingQueueItem,
    paymentQueueItem,
    {
      ...pendingQueueItem,
      localId: 'synced-local-visit',
      status: 'synced',
    },
  ],
});

assert.equal(request.deviceId, 'ios-device-1');
assert.equal(request.changes.length, 2);
assert.equal(request.changes[0].localId, 'local-visit-1');
assert.deepEqual(request.changes[1], {
  recordKind: 'payment',
  localId: 'local-payment-1',
  serverId: undefined,
  operation: 'create',
  marketId: 'market-1',
  collectedById: 'supervisor-1',
  amount: 250,
  dueDate: undefined,
  paidAt: '2026-06-01',
  status: 'PARTIAL',
  notes: 'Partial payment',
  baseServerUpdatedAt: undefined,
  clientUpdatedAt: '2026-06-01T09:35:00.000Z',
});

const calls: Array<{ url: string; init?: RequestInit }> = [];

const getAuthorizationHeader = (headers: HeadersInit | undefined): string => {
  if (headers instanceof Headers) {
    return headers.get('Authorization') ?? '';
  }

  if (Array.isArray(headers)) {
    return headers.find(([key]) => key === 'Authorization')?.[1] ?? '';
  }

  return headers?.Authorization ?? '';
};

const getRequestBody = (
  init: RequestInit | undefined,
): {
  query?: string;
  variables?: Record<string, unknown>;
} => {
  if (typeof init?.body !== 'string') {
    return {};
  }

  return JSON.parse(init.body) as {
    query?: string;
    variables?: Record<string, unknown>;
  };
};

globalThis.fetch = (async (url, init) => {
  calls.push({ url: String(url), init });

  if (String(url) === 'file:///photo.jpg') {
    return new Response(new Blob(['photo'], { type: 'image/jpeg' }), {
      status: 200,
    });
  }

  if (String(url).endsWith('/graphql')) {
    if (typeof init?.body !== 'string') {
      return new Response(
        JSON.stringify({
          data: {
            uploadFilesFieldFileByUniversalIdentifier: {
              id: 'file-upload-1',
            },
          },
        }),
        { status: 200 },
      );
    }
  }

  if (String(url).endsWith('/rest/shahryar/mobile/auth/login')) {
    return new Response(
      JSON.stringify({
        tokens: {
          accessOrWorkspaceAgnosticToken: {
            token: 'access-token-from-login',
          },
        },
      }),
      { status: 200 },
    );
  }

  if (String(url).endsWith('/rest/shahryar/mobile/sync/pull')) {
    return new Response(
      JSON.stringify({
        serverTime: '2026-06-01T10:00:00.000Z',
        nextPullCursor: '2026-06-01T10:00:00.000Z',
        currentSupervisorId: 'supervisor-1',
        assignedMarkets: [],
        serverVisits: [],
        serverRecords: [],
      }),
      { status: 200 },
    );
  }

  if (String(url).endsWith('/rest/shahryar/mobile/photo-associations')) {
    return new Response(
      JSON.stringify({
        localPhotoId: 'local-photo-1',
        fileId: 'file-1',
        targetType: 'visit',
        targetId: 'server-visit-1',
        associatedAt: '2026-06-01T10:00:00.000Z',
      }),
      { status: 200 },
    );
  }

  if (String(url).endsWith('/rest/shahryar/mobile/notifications/register')) {
    return new Response(
      JSON.stringify({
        deviceId: 'ios-device-1',
        registeredAt: '2026-06-01T10:00:00.000Z',
        enabledNotificationKinds: ['missing-report', 'missed-visit'],
      }),
      { status: 200 },
    );
  }

  return new Response(
    JSON.stringify({
      deviceId: 'ios-device-1',
      nextPullCursor: '2026-06-01T10:00:00.000Z',
      acceptedChanges: [
        {
          localId: 'local-visit-1',
          recordKind: 'visit',
          serverId: 'server-visit-1',
          operation: 'update',
          acceptedAt: '2026-06-01T10:00:00.000Z',
        },
      ],
      conflicts: [],
      rejectedChanges: [],
    }),
    { status: 200 },
  );
}) as typeof fetch;

const runApiTests = async () => {
  const accessToken = await signInShahryarMobile({
    apiBaseUrl: 'https://api.example.test',
    username: 'karwan',
    password: 'password',
  });

  assert.equal(accessToken, 'access-token-from-login');
  assert.equal(
    calls[0].url,
    'https://api.example.test/rest/shahryar/mobile/auth/login',
  );
  assert.deepEqual(JSON.parse(String(calls[0].init?.body)), {
    origin: 'https://api.example.test',
    password: 'password',
    username: 'karwan',
  });
  calls.length = 0;

  await syncOfflineVisitQueue({
    apiBaseUrl: 'https://api.example.test',
    accessToken: 'access-token',
    deviceId: 'ios-device-1',
    queue: [pendingQueueItem],
  });

  assert.deepEqual(getRequestBody(calls[2].init), {
    deviceId: 'ios-device-1',
    changes: [
      {
        recordKind: 'visit',
        localId: 'local-visit-1',
        serverId: 'server-visit-1',
        operation: 'update',
        assignedMarketId: 'market-1',
        supervisorId: 'supervisor-1',
        checkInAt: '2026-06-01T09:00:00.000Z',
        gpsLocation: {
          latitude: 36.191,
          longitude: 44.009,
        },
        photoFileIds: ['file-existing-1', 'file-upload-1'],
        soldCartons: 12,
        requestedCartons: 4,
        issue: 'Late payment',
        decisionMaker: 'Store owner',
        requestDetails: 'Four cartons requested',
        report: 'Visit completed',
        baseServerUpdatedAt: '2026-06-01T09:10:00.000Z',
        clientUpdatedAt: '2026-06-01T09:30:00.000Z',
      },
    ],
  });

  const pullResponse = await pullShahryarMobileSyncData({
    apiBaseUrl: 'https://api.example.test',
    accessToken: 'access-token',
  });

  assert.equal(pullResponse.currentSupervisorId, 'supervisor-1');

  await associateShahryarMobilePhoto({
    apiBaseUrl: 'https://api.example.test',
    accessToken: 'access-token',
    request: {
      localPhotoId: 'local-photo-1',
      fileId: 'file-1',
      targetType: 'visit',
      targetId: 'server-visit-1',
      capturedAt: '2026-06-01T09:10:00.000Z',
    },
  });

  await registerShahryarMobileNotifications({
    apiBaseUrl: 'https://api.example.test',
    accessToken: 'access-token',
    request: {
      deviceId: 'ios-device-1',
      expoPushToken: 'ExponentPushToken[test]',
      platform: 'ios',
    },
  });

  assert.deepEqual(
    calls.map((call) => call.url),
    [
      'file:///photo.jpg',
      'https://api.example.test/graphql',
      'https://api.example.test/rest/shahryar/mobile/sync',
      'https://api.example.test/rest/shahryar/mobile/photo-associations',
      'https://api.example.test/rest/shahryar/mobile/photo-associations',
      'https://api.example.test/rest/shahryar/mobile/sync/pull',
      'https://api.example.test/rest/shahryar/mobile/photo-associations',
      'https://api.example.test/rest/shahryar/mobile/notifications/register',
    ],
  );
  assert.equal(
    calls
      .filter((call) => call.url !== 'file:///photo.jpg')
      .every((call) =>
        getAuthorizationHeader(call.init?.headers).includes('access-token'),
      ),
    true,
  );

  console.log('shahryarMobileApi tests passed');
};

void runApiTests();
