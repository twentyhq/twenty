import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildFathomMeeting } from 'src/__tests__/utils/build-fathom-meeting.util';
import { FATHOM_GENERATE_CALL_RECORDING_TITLE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { computeCallRecordingIdForFathomMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fathom-meeting.util';
import { syncFathomMeetingToCallRecording } from 'src/logic-functions/utils/sync-fathom-meeting-to-call-recording.util';
import { isDefined } from 'src/utils/is-defined';

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

type MutationRequest = {
  updateFathomRecordingImports?: unknown;
};

const MEETING = {
  ...buildFathomMeeting({ recordingId: 1 }),
  title: 'Impromptu Zoom Meeting',
  meetingTitle: 'Impromptu Zoom Meeting',
  meetingUrl: null,
  defaultSummary: {
    templateName: null,
    markdownFormatted: '## Pricing discussion',
  },
};
const CALL_RECORDING_ID = computeCallRecordingIdForFathomMeeting(
  MEETING.recordingId,
);
const PLACEHOLDER_TITLE = 'Impromptu Zoom Meeting (20 Aug 2026, 10:00 UTC)';

const buildCallRecordingNode = (title: string) => ({
  id: CALL_RECORDING_ID,
  updatedAt: '2026-08-20T12:00:00.000Z',
  deletedAt: null,
  status: 'PROCESSING',
  title,
  video: [],
  audio: [],
  fathomRecordingImports: null,
});

const buildCoreApiClient = (titles: string[]) => ({
  query: vi.fn().mockResolvedValue({
    callRecordings: {
      edges: titles.map(buildCallRecordingNode).map((node) => ({ node })),
    },
  }),
  mutation: vi.fn(async (request: MutationRequest) =>
    isDefined(request.updateFathomRecordingImports)
      ? { updateFathomRecordingImports: [{ id: CALL_RECORDING_ID }] }
      : { updateCallRecordings: [{ id: CALL_RECORDING_ID }] },
  ),
});

describe('syncFathomMeetingToCallRecording', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.enqueueJobs.mockResolvedValue({ enqueued: true });
    mocks.kvGet.mockResolvedValue(null);
  });

  it.each([
    { description: 'a new recording', titles: [], isTitleQueued: true },
    {
      description: 'a recording still holding its placeholder title',
      titles: [PLACEHOLDER_TITLE],
      isTitleQueued: true,
    },
    {
      description: 'a recording that already has a generated title',
      titles: ['Impromptu Zoom Meeting (Pricing discussion)'],
      isTitleQueued: false,
    },
  ])(
    'queues a title for $description only while it is needed',
    async ({ titles, isTitleQueued }) => {
      await syncFathomMeetingToCallRecording({
        coreApiClient: buildCoreApiClient(titles),
        meeting: MEETING,
        connectedAccountId: 'connection-1',
      });

      expect(
        mocks.enqueueJobs.mock.calls.filter(
          ([input]) =>
            input.logicFunctionUniversalIdentifier ===
            FATHOM_GENERATE_CALL_RECORDING_TITLE_UNIVERSAL_IDENTIFIER,
        ),
      ).toEqual(
        isTitleQueued
          ? [
              [
                expect.objectContaining({
                  jobs: [
                    {
                      jobId: `fathom-call-recording-title-${CALL_RECORDING_ID}`,
                      payload: {
                        callRecordingId: CALL_RECORDING_ID,
                        expectedTitle: PLACEHOLDER_TITLE,
                        originalTitle: 'Impromptu Zoom Meeting',
                        summary: '## Pricing discussion',
                      },
                    },
                  ],
                }),
              ],
            ]
          : [],
      );
    },
  );

  it('reads the state of a brand-new recording once and does not re-read it to complete it', async () => {
    const coreApiClient = buildCoreApiClient([]);

    expect(
      await syncFathomMeetingToCallRecording({
        coreApiClient,
        meeting: MEETING,
        connectedAccountId: 'connection-1',
      }),
    ).toEqual({ callRecordingId: CALL_RECORDING_ID, created: true });
    expect(coreApiClient.query).toHaveBeenCalledOnce();
  });

  it('skips a deleted recording without writing to it', async () => {
    const coreApiClient = buildCoreApiClient([]);
    const deletedCallRecordingNode = {
      ...buildCallRecordingNode(PLACEHOLDER_TITLE),
      deletedAt: '2026-08-21T00:00:00.000Z',
    };

    coreApiClient.query.mockResolvedValue({
      callRecordings: { edges: [{ node: deletedCallRecordingNode }] },
    });

    expect(
      await syncFathomMeetingToCallRecording({
        coreApiClient,
        meeting: MEETING,
        connectedAccountId: 'connection-1',
      }),
    ).toEqual({
      callRecordingId: CALL_RECORDING_ID,
      skipped: true,
      reason: 'The call recording has been deleted',
    });
    expect(coreApiClient.mutation).not.toHaveBeenCalled();
  });
});
