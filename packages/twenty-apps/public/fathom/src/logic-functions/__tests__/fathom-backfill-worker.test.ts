import { type Meeting } from 'fathom-typescript/sdk/models/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER } from 'src/constants/fathom-backfill-batch-universal-identifier';
import { FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER } from 'src/constants/fathom-backfill-worker-universal-identifier';
import { fathomBackfillWorkerHandler } from 'src/logic-functions/fathom-backfill-worker';

const runtimeMocks = vi.hoisted(() => ({
  createFathomClient: vi.fn(),
  enqueueJob: vi.fn(),
  getConnection: vi.fn(),
  keyValueStore: new Map<string, unknown>(),
  listAccessibleFathomMeetingPage: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJob: runtimeMocks.enqueueJob,
  getConnection: runtimeMocks.getConnection,
  kv: {
    get: vi.fn(async (key: string) => runtimeMocks.keyValueStore.get(key) ?? null),
    set: vi.fn(async (key: string, value: unknown) => {
      runtimeMocks.keyValueStore.set(key, value);
    }),
  },
}));

vi.mock('src/logic-functions/utils/create-fathom-client.util', () => ({
  createFathomClient: runtimeMocks.createFathomClient,
}));

vi.mock(
  'src/logic-functions/utils/list-accessible-fathom-meeting-page.util',
  () => ({
    listAccessibleFathomMeetingPage:
      runtimeMocks.listAccessibleFathomMeetingPage,
  }),
);

const buildMeeting = (recordingId: number, recorderEmail: string): Meeting => ({
  title: `Recording ${recordingId}`,
  meetingTitle: `Meeting ${recordingId}`,
  meetingType: null,
  recordingId,
  url: `https://fathom.video/calls/${recordingId}`,
  meetingUrl: 'https://meet.example.com/customer-call',
  shareUrl: `https://fathom.video/share/${recordingId}`,
  createdAt: new Date('2026-08-20T10:00:00.000Z'),
  scheduledStartTime: new Date('2026-08-20T10:00:00.000Z'),
  scheduledEndTime: new Date('2026-08-20T10:30:00.000Z'),
  recordingStartTime: new Date('2026-08-20T10:00:00.000Z'),
  recordingEndTime: new Date('2026-08-20T10:30:00.000Z'),
  calendarInviteesDomainsType: 'one_or_more_external',
  sharedWith: 'single_team',
  transcriptLanguage: 'en',
  calendarInvitees: [],
  recordedBy: {
    name: recorderEmail,
    email: recorderEmail,
    emailDomain: recorderEmail.split('@')[1],
    team: 'Sales',
  },
});

describe('fathomBackfillWorkerHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runtimeMocks.keyValueStore.clear();
    vi.spyOn(Date, 'now').mockReturnValue(
      Date.parse('2026-08-27T00:00:00.000Z'),
    );
    runtimeMocks.getConnection.mockResolvedValue({
      accessToken: 'fathom-access-token',
    });
    runtimeMocks.createFathomClient.mockReturnValue({});
    runtimeMocks.enqueueJob.mockResolvedValue({ enqueued: true });
  });

  it('continues through cursor pages and queues meetings from different recorders', async () => {
    runtimeMocks.listAccessibleFathomMeetingPage
      .mockResolvedValueOnce({
        meetings: [
          buildMeeting(1, 'owner@example.com'),
          buildMeeting(2, 'teammate@example.com'),
        ],
        nextCursor: 'next-page',
      })
      .mockResolvedValueOnce({
        meetings: [buildMeeting(3, 'another-teammate@example.com')],
        nextCursor: null,
      });

    await fathomBackfillWorkerHandler({
      connectedAccountId: 'connected-account-1',
      days: 30,
    });

    const continuationJob = runtimeMocks.enqueueJob.mock.calls.find(
      ([job]) =>
        job.logicFunctionUniversalIdentifier ===
        FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
    )?.[0];

    expect(continuationJob).toBeDefined();

    await fathomBackfillWorkerHandler(continuationJob.payload);

    const importJobs = runtimeMocks.enqueueJob.mock.calls
      .map(([job]) => job)
      .filter(
        (job) =>
          job.logicFunctionUniversalIdentifier ===
          FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER,
      );

    expect(
      importJobs.flatMap((job) =>
        job.payload.meetings.map(
          (meeting: { recordingId: number }) => meeting.recordingId,
        ),
      ),
    ).toEqual([1, 2, 3]);
    expect(runtimeMocks.listAccessibleFathomMeetingPage).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ cursor: 'next-page' }),
    );
  });

  it('places overlapping backfills for one connection in separate batch slots', async () => {
    runtimeMocks.listAccessibleFathomMeetingPage
      .mockResolvedValueOnce({
        meetings: [buildMeeting(1, 'owner@example.com')],
        nextCursor: null,
      })
      .mockResolvedValueOnce({
        meetings: [buildMeeting(2, 'owner@example.com')],
        nextCursor: null,
      });

    await fathomBackfillWorkerHandler({
      connectedAccountId: 'connected-account-1',
      days: 7,
    });
    await fathomBackfillWorkerHandler({
      connectedAccountId: 'connected-account-1',
      days: 30,
    });

    const importJobDelays = runtimeMocks.enqueueJob.mock.calls
      .map(([job]) => job)
      .filter(
        (job) =>
          job.logicFunctionUniversalIdentifier ===
          FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER,
      )
      .map((job) => job.delayMs);

    expect(importJobDelays).toEqual([0, 20_000]);
  });
});
