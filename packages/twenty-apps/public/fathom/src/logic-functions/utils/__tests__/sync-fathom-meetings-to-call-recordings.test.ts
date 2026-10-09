import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildFathomMeeting } from 'src/__tests__/utils/build-fathom-meeting.util';
import {
  FATHOM_GENERATE_CALL_RECORDING_TITLE_UNIVERSAL_IDENTIFIER,
  FATHOM_REQUEST_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { buildFathomCallRecordingTitle } from 'src/logic-functions/utils/build-fathom-call-recording-title.util';
import { computeCallRecordingIdForFathomMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fathom-meeting.util';
import { syncFathomMeetingsToCallRecordings } from 'src/logic-functions/utils/sync-fathom-meetings-to-call-recordings.util';

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

type CallRecordingNode = { id: string } & Record<string, unknown>;

type QueryRequest = {
  calendarEvents?: unknown;
  callRecordings?: {
    __args: { filter: { id: { eq?: string; in?: string[] } } };
  };
};

type MutationRequest = Record<
  string,
  { __args: { data: { id?: string }; filter?: unknown } }
>;

const CONNECTED_ACCOUNT_ID = 'connection-1';
const MEETINGS = [1, 2, 3].map((recordingId) =>
  buildFathomMeeting({
    recordingId,
    recordingStartTime: `2026-08-20T1${recordingId}:00:00.000Z`,
  }),
);
const CALL_RECORDING_IDS = MEETINGS.map((meeting) =>
  computeCallRecordingIdForFathomMeeting(meeting.recordingId),
);

const buildExistingNode = (
  id: string,
  overrides: Record<string, unknown> = {},
): CallRecordingNode => ({
  id,
  updatedAt: '2026-08-20T12:00:00.000Z',
  deletedAt: null,
  status: 'PROCESSING',
  recordingRequestStatus: 'REQUESTED',
  video: [{ fileId: 'video-file-id' }],
  audio: [],
  transcript: [{ participant: { name: 'Owner' }, words: [] }],
  summary: { markdown: 'Summary', blocknote: null },
  fathomRecordingImports: {
    edges: [
      {
        node: {
          id,
          updatedAt: '2026-08-20T12:01:00.000Z',
          recordingId: '1',
          connectedAccountId: CONNECTED_ACCOUNT_ID,
        },
      },
    ],
  },
  ...overrides,
});

const buildCoreApiClient = ({
  callRecordingNodes,
  mutation,
}: {
  callRecordingNodes: CallRecordingNode[];
  mutation: (request: MutationRequest) => Promise<unknown>;
}) => {
  const query = vi.fn();

  query.mockImplementation(async (request: QueryRequest) => {
    if (request.calendarEvents !== undefined) {
      return {
        calendarEvents: {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      };
    }

    const idFilter = request.callRecordings?.__args.filter.id;
    const queriedIds = idFilter?.in ?? [idFilter?.eq];

    return {
      callRecordings: {
        edges: callRecordingNodes
          .filter((node) => queriedIds.includes(node.id))
          .map((node) => ({ node })),
      },
    };
  });

  return {
    query,
    mutation: vi.fn().mockImplementation(mutation),
  };
};

const getMutationNames = (mutation: ReturnType<typeof vi.fn>) =>
  mutation.mock.calls.map(([request]) => Object.keys(request)[0]);

const getQueryNames = (query: ReturnType<typeof vi.fn>) =>
  query.mock.calls.map(([request]) => Object.keys(request)[0]);

describe('syncFathomMeetingsToCallRecordings', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.enqueueJobs.mockResolvedValue({ enqueued: true });
    mocks.kvGet.mockResolvedValue(null);
  });

  it('saves a batch of new recordings with one read of each kind and one create per object', async () => {
    const coreApiClient = buildCoreApiClient({
      callRecordingNodes: [],
      mutation: async () => ({}),
    });

    const results = await syncFathomMeetingsToCallRecordings({
      coreApiClient,
      meetings: MEETINGS,
      connectedAccountId: CONNECTED_ACCOUNT_ID,
    });

    expect(results).toEqual(
      CALL_RECORDING_IDS.map((callRecordingId) => ({
        callRecordingId,
        calendarEventId: undefined,
        created: true,
      })),
    );
    expect(getQueryNames(coreApiClient.query)).toEqual([
      'callRecordings',
      'calendarEvents',
    ]);
    expect(coreApiClient.query).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        callRecordings: expect.objectContaining({
          __args: expect.objectContaining({
            filter: expect.objectContaining({
              id: { in: CALL_RECORDING_IDS },
            }),
          }),
        }),
      }),
    );
    expect(getMutationNames(coreApiClient.mutation)).toEqual([
      'createCallRecordings',
      'createFathomRecordingImports',
    ]);
    expect(coreApiClient.mutation).toHaveBeenNthCalledWith(1, {
      createCallRecordings: {
        __args: {
          data: CALL_RECORDING_IDS.map((id) =>
            expect.objectContaining({ id, status: 'PROCESSING' }),
          ),
        },
        id: true,
      },
    });
    expect(coreApiClient.mutation).toHaveBeenNthCalledWith(2, {
      createFathomRecordingImports: {
        __args: {
          data: CALL_RECORDING_IDS.map((id, index) => ({
            id,
            callRecordingId: id,
            recordingId: String(MEETINGS[index].recordingId),
            connectedAccountId: CONNECTED_ACCOUNT_ID,
          })),
        },
        id: true,
      },
    });
    expect(mocks.enqueueJobs).toHaveBeenCalledTimes(3);
    expect(
      mocks.enqueueJobs.mock.calls.map(([input]) => input.payloads),
    ).toEqual(
      CALL_RECORDING_IDS.map((callRecordingId) => [{ callRecordingId }]),
    );
    expect(mocks.enqueueJobs).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunctionUniversalIdentifier:
          FATHOM_REQUEST_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER,
      }),
    );
  });

  it('updates an existing recording under its optimistic guards and completes it', async () => {
    const [callRecordingId] = CALL_RECORDING_IDS;
    const coreApiClient = buildCoreApiClient({
      callRecordingNodes: [buildExistingNode(callRecordingId)],
      mutation: async (request) =>
        'updateFathomRecordingImports' in request
          ? { updateFathomRecordingImports: [{ id: callRecordingId }] }
          : { updateCallRecordings: [{ id: callRecordingId }] },
    });

    await syncFathomMeetingsToCallRecordings({
      coreApiClient,
      meetings: [MEETINGS[0]],
      connectedAccountId: CONNECTED_ACCOUNT_ID,
    });

    expect(getMutationNames(coreApiClient.mutation)).toEqual([
      'updateCallRecordings',
      'updateFathomRecordingImports',
      'updateCallRecordings',
    ]);
    expect(coreApiClient.mutation).toHaveBeenNthCalledWith(1, {
      updateCallRecordings: {
        __args: {
          filter: {
            id: { eq: callRecordingId },
            updatedAt: { eq: '2026-08-20T12:00:00.000Z' },
          },
          data: expect.not.objectContaining({
            transcript: expect.anything(),
          }),
        },
        id: true,
      },
    });
    expect(coreApiClient.mutation).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        updateCallRecordings: expect.objectContaining({
          __args: expect.objectContaining({
            filter: expect.objectContaining({
              transcript: { like: '[_%]' },
              status: { eq: 'PROCESSING' },
            }),
            data: { status: 'COMPLETED' },
          }),
        }),
      }),
    );
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });

  it('does not write or look up a recording deleted after its page was listed', async () => {
    const [callRecordingId] = CALL_RECORDING_IDS;
    const coreApiClient = buildCoreApiClient({
      callRecordingNodes: [
        buildExistingNode(callRecordingId, {
          deletedAt: '2026-08-21T00:00:00.000Z',
        }),
      ],
      mutation: async () => ({}),
    });

    expect(
      await syncFathomMeetingsToCallRecordings({
        coreApiClient,
        meetings: [MEETINGS[0]],
        connectedAccountId: CONNECTED_ACCOUNT_ID,
      }),
    ).toEqual([
      {
        callRecordingId,
        skipped: true,
        reason: 'The call recording has been deleted',
      },
    ]);
    expect(coreApiClient.query).toHaveBeenCalledOnce();
    expect(coreApiClient.mutation).not.toHaveBeenCalled();
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });

  it('falls back to one create per recording when the batch create is rejected and leaves a recording created meanwhile untouched', async () => {
    const [firstCallRecordingId, secondCallRecordingId] = CALL_RECORDING_IDS;
    const callRecordingNodes: CallRecordingNode[] = [];
    const coreApiClient = buildCoreApiClient({
      callRecordingNodes,
      mutation: async (request) => {
        if ('createCallRecordings' in request) {
          throw new Error('duplicate key');
        }

        if (
          'createCallRecording' in request &&
          request.createCallRecording.__args.data.id === secondCallRecordingId
        ) {
          callRecordingNodes.push(
            buildExistingNode(secondCallRecordingId, { video: [] }),
          );

          throw new Error('duplicate key');
        }

        return {};
      },
    });

    const results = await syncFathomMeetingsToCallRecordings({
      coreApiClient,
      meetings: MEETINGS.slice(0, 2),
      connectedAccountId: CONNECTED_ACCOUNT_ID,
    });

    expect(results).toEqual([
      expect.objectContaining({
        callRecordingId: firstCallRecordingId,
        created: true,
      }),
      expect.objectContaining({
        callRecordingId: secondCallRecordingId,
        created: false,
      }),
    ]);
    expect(getMutationNames(coreApiClient.mutation)).toEqual([
      'createCallRecordings',
      'createCallRecording',
      'createCallRecording',
      'createFathomRecordingImport',
      'createFathomRecordingImport',
    ]);
    expect(mocks.enqueueJobs).toHaveBeenCalledTimes(2);
  });

  it('fails without writing over a recording deleted while the batch create was rejected', async () => {
    const [, secondCallRecordingId] = CALL_RECORDING_IDS;
    const coreApiClient = buildCoreApiClient({
      callRecordingNodes: [],
      mutation: async (request) => {
        if (
          'createCallRecordings' in request ||
          ('createCallRecording' in request &&
            request.createCallRecording.__args.data.id ===
              secondCallRecordingId)
        ) {
          throw new Error('duplicate key');
        }

        return {};
      },
    });

    await expect(
      syncFathomMeetingsToCallRecordings({
        coreApiClient,
        meetings: MEETINGS.slice(0, 2),
        connectedAccountId: CONNECTED_ACCOUNT_ID,
      }),
    ).rejects.toThrow('duplicate key');
    expect(getMutationNames(coreApiClient.mutation)).toEqual([
      'createCallRecordings',
      'createCallRecording',
      'createCallRecording',
    ]);
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });

  describe('title generation', () => {
    const IMPROMPTU_MEETINGS = MEETINGS.slice(0, 2).map((meeting) => ({
      ...meeting,
      title: 'Impromptu Zoom Meeting',
      meetingTitle: 'Impromptu Zoom Meeting',
      defaultSummary: {
        templateName: null,
        markdownFormatted: '## Pricing discussion',
      },
    }));
    const IMPROMPTU_CALL_RECORDING_IDS = CALL_RECORDING_IDS.slice(0, 2);

    const getTitleJobs = () =>
      mocks.enqueueJobs.mock.calls
        .map(([input]) => input)
        .filter(
          (input) =>
            input.logicFunctionUniversalIdentifier ===
            FATHOM_GENERATE_CALL_RECORDING_TITLE_UNIVERSAL_IDENTIFIER,
        )
        .flatMap((input) => input.jobs);

    it('still queues titles once for recordings whose first save was interrupted after they were created', async () => {
      const callRecordingNodes: CallRecordingNode[] = [];
      const interruptedClient = buildCoreApiClient({
        callRecordingNodes,
        mutation: async (request) => {
          if ('createCallRecordings' in request) {
            for (const data of request.createCallRecordings.__args
              .data as unknown as Array<{ id: string; title: string }>) {
              callRecordingNodes.push(
                buildExistingNode(data.id, {
                  title: data.title,
                  video: [],
                  fathomRecordingImports: null,
                }),
              );
            }

            return {};
          }

          throw new RetryableLogicFunctionError('rate limited');
        },
      });

      await expect(
        syncFathomMeetingsToCallRecordings({
          coreApiClient: interruptedClient,
          meetings: IMPROMPTU_MEETINGS,
          connectedAccountId: CONNECTED_ACCOUNT_ID,
        }),
      ).rejects.toBeInstanceOf(RetryableLogicFunctionError);
      expect(getTitleJobs()).toEqual([]);

      await syncFathomMeetingsToCallRecordings({
        coreApiClient: buildCoreApiClient({
          callRecordingNodes,
          mutation: async (request) =>
            'updateCallRecordings' in request
              ? { updateCallRecordings: [{ id: 'updated' }] }
              : {},
        }),
        meetings: IMPROMPTU_MEETINGS,
        connectedAccountId: CONNECTED_ACCOUNT_ID,
      });

      expect(getTitleJobs()).toEqual(
        IMPROMPTU_MEETINGS.map((meeting, index) => ({
          jobId: `fathom-call-recording-title-${IMPROMPTU_CALL_RECORDING_IDS[index]}`,
          payload: {
            callRecordingId: IMPROMPTU_CALL_RECORDING_IDS[index],
            expectedTitle: buildFathomCallRecordingTitle(meeting).title,
            originalTitle: 'Impromptu Zoom Meeting',
            summary: '## Pricing discussion',
          },
        })),
      );
    });

    it('does not queue a title again for a recording that already has a generated title', async () => {
      await syncFathomMeetingsToCallRecordings({
        coreApiClient: buildCoreApiClient({
          callRecordingNodes: IMPROMPTU_CALL_RECORDING_IDS.map((id) =>
            buildExistingNode(id, {
              title: 'Impromptu Zoom Meeting (Pricing discussion)',
            }),
          ),
          mutation: async (request) =>
            'updateFathomRecordingImports' in request
              ? { updateFathomRecordingImports: [{ id: 'updated' }] }
              : { updateCallRecordings: [{ id: 'updated' }] },
        }),
        meetings: IMPROMPTU_MEETINGS,
        connectedAccountId: CONNECTED_ACCOUNT_ID,
      });

      expect(getTitleJobs()).toEqual([]);
    });
  });
});
