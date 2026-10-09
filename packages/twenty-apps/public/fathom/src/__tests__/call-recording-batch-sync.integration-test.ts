import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createCallRecordingSyncTestContext } from 'src/__tests__/utils/create-call-recording-sync-test-context.util';
import { FATHOM_REQUEST_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildFathomMeetingSyncPlan } from 'src/logic-functions/utils/build-fathom-meeting-sync-plan.util';
import { createCallRecordings } from 'src/logic-functions/utils/create-call-recordings.util';

const mocks = vi.hoisted(() => ({
  enqueueJobs: vi.fn(),
  kvGet: vi.fn(),
  kvSet: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  enqueueJobs: mocks.enqueueJobs,
  kv: { get: mocks.kvGet, set: mocks.kvSet },
}));

const fathomRecordingImportsSchema = z.object({
  fathomRecordingImports: z.object({
    edges: z.array(z.object({ node: z.object({ id: z.string() }) })),
  }),
});

const context = createCallRecordingSyncTestContext();

const getQueuedMediaDownloads = () =>
  mocks.enqueueJobs.mock.calls
    .map(([input]) => input)
    .filter(
      (input) =>
        input.logicFunctionUniversalIdentifier ===
        FATHOM_REQUEST_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER,
    )
    .flatMap((input) => input.payloads);

describe('Fathom call recording batch sync', () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    mocks.enqueueJobs.mockResolvedValue({ enqueued: true });
    mocks.kvGet.mockResolvedValue(null);
    await context.setUp();
  });

  afterEach(() => context.cleanUp());

  it('creates a new page in one batch and writes nothing when the completed page is synced again', async () => {
    const meetings = context.buildMeetings(3);
    const callRecordingIds = context.getCallRecordingIds(meetings);

    expect(await context.syncPage(meetings)).toMatchObject({
      deletedMeetingCount: 0,
      upToDateMeetingCount: 0,
    });
    expect(context.getMutationNames()).toEqual([
      ['createCallRecordings'],
      ['createFathomRecordingImports'],
    ]);
    expect(getQueuedMediaDownloads()).toEqual(
      callRecordingIds.map((callRecordingId) => ({ callRecordingId })),
    );

    await context.settleMedia(callRecordingIds);

    const callRecordingsBeforeRerun =
      await context.readCallRecordings(callRecordingIds);

    context.clearMutations();

    expect(await context.syncPage(meetings)).toMatchObject({
      importableMeetings: [],
      upToDateMeetingCount: 3,
    });
    expect(context.getMutationNames()).toEqual([]);
    expect(await context.readCallRecordings(callRecordingIds)).toEqual(
      callRecordingsBeforeRerun,
    );
  });

  it('still creates the rest of a batch when one recording already exists', async () => {
    const meetings = context.buildMeetings(3);
    const [existingCallRecordingId, ...newCallRecordingIds] =
      context.getCallRecordingIds(meetings);

    await context.syncPage(meetings.slice(0, 1));

    const existingCallRecording = await context.readCallRecording(
      existingCallRecordingId,
    );

    context.clearMutations();

    expect(
      await context.syncMeetings({
        meetings,
        callRecordingSyncStates: new Map(),
      }),
    ).toEqual([
      expect.objectContaining({
        callRecordingId: existingCallRecordingId,
        created: false,
      }),
      ...newCallRecordingIds.map((callRecordingId) =>
        expect.objectContaining({ callRecordingId, created: true }),
      ),
    ]);
    expect(context.getMutationNames().slice(0, 4)).toEqual([
      ['createCallRecordings'],
      ['createCallRecording'],
      ['createCallRecording'],
      ['createCallRecording'],
    ]);
    expect([
      ...(await context.readCallRecordings(newCallRecordingIds)).keys(),
    ]).toEqual(expect.arrayContaining(newCallRecordingIds));
    expect(await context.readCallRecording(existingCallRecordingId)).toEqual(
      existingCallRecording,
    );
  });

  it('finishes recordings whose batch stopped before their imports were saved', async () => {
    const meetings = context.buildMeetings(2);
    const callRecordingIds = context.getCallRecordingIds(meetings);

    await createCallRecordings({
      coreApiClient: context.syncClient,
      callRecordings: meetings.map((meeting) => {
        const plan = buildFathomMeetingSyncPlan({
          meeting,
          existingCallRecording: undefined,
          calendarEventId: undefined,
          connectedAccountId: 'interrupted-connection',
          retryMedia: false,
        });

        return {
          id: plan.callRecordingId,
          fields: plan.createCallRecordingFields,
        };
      }),
    });

    expect(await context.syncMeetings({ meetings })).toEqual(
      callRecordingIds.map((callRecordingId) =>
        expect.objectContaining({ callRecordingId, created: false }),
      ),
    );

    const fathomRecordingImports = fathomRecordingImportsSchema.parse(
      await context.syncClient.query({
        fathomRecordingImports: {
          __args: { filter: { id: { in: callRecordingIds } } },
          edges: { node: { id: true } },
        },
      }),
    );

    expect(
      fathomRecordingImports.fathomRecordingImports.edges.map(
        ({ node }) => node.id,
      ),
    ).toEqual(expect.arrayContaining(callRecordingIds));
    expect(getQueuedMediaDownloads()).toEqual(
      expect.arrayContaining(
        callRecordingIds.map((callRecordingId) => ({ callRecordingId })),
      ),
    );
  });
});
