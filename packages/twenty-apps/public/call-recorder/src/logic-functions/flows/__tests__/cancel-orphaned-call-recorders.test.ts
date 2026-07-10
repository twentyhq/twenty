import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cancelOrphanedCallRecorders } from 'src/logic-functions/flows/cancel-orphaned-call-recorders.util';

const listScheduledRecallBotsMock = vi.hoisted(() => vi.fn());
const cancelRecallBotMock = vi.hoisted(() => vi.fn());
const ejectRecallBotMock = vi.hoisted(() => vi.fn());
const getCurrentWorkspaceIdMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/data/get-current-workspace-id.util', () => ({
  getCurrentWorkspaceId: getCurrentWorkspaceIdMock,
}));

vi.mock(
  'src/logic-functions/recall-api/list-scheduled-recall-bots.util',
  () => ({
    listScheduledRecallBots: listScheduledRecallBotsMock,
  }),
);

vi.mock('src/logic-functions/recall-api/cancel-recall-bot.util', () => ({
  cancelRecallBot: cancelRecallBotMock,
}));

vi.mock('src/logic-functions/recall-api/eject-recall-bot.util', () => ({
  ejectRecallBot: ejectRecallBotMock,
}));

const JOIN_AT_AFTER = '2026-01-01T08:00:00.000Z';
const JOIN_AT_BEFORE = '2026-01-02T12:00:00.000Z';
const CURRENT_WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';
const OTHER_WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174999';

type CallRecordingNode = {
  id: string;
  recordingRequestStatus?: string | null;
  externalBotId?: string | null;
};

class FakeCoreApiClient {
  constructor(private callRecordings: CallRecordingNode[]) {}

  async query(query: any): Promise<any> {
    const callRecordingIds = query.callRecordings.__args.filter.id.in;

    return {
      callRecordings: {
        pageInfo: { hasNextPage: false, endCursor: undefined },
        edges: this.callRecordings
          .filter((callRecording) =>
            callRecordingIds.includes(callRecording.id),
          )
          .map((node) => ({ node })),
      },
    };
  }
}

const buildClient = (callRecordings: CallRecordingNode[]): CoreApiClient =>
  new FakeCoreApiClient(callRecordings) as unknown as CoreApiClient;

const buildBot = ({
  id,
  twentyCallRecordingId,
  twentyWorkspaceId,
}: {
  id: string;
  twentyCallRecordingId?: string;
  twentyWorkspaceId?: string;
}) => ({
  id,
  metadata: {
    ...(twentyCallRecordingId === undefined ? {} : { twentyCallRecordingId }),
    ...(twentyWorkspaceId === undefined ? {} : { twentyWorkspaceId }),
  },
});

const buildCurrentWorkspaceBot = ({
  id,
  twentyCallRecordingId,
}: {
  id: string;
  twentyCallRecordingId: string;
}) =>
  buildBot({
    id,
    twentyCallRecordingId,
    twentyWorkspaceId: CURRENT_WORKSPACE_ID,
  });

describe('cancelOrphanedCallRecorders', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    getCurrentWorkspaceIdMock.mockReset();
    getCurrentWorkspaceIdMock.mockReturnValue(CURRENT_WORKSPACE_ID);
    listScheduledRecallBotsMock.mockReset();
    cancelRecallBotMock.mockReset();
    cancelRecallBotMock.mockResolvedValue({ ok: true });
    ejectRecallBotMock.mockReset();
    ejectRecallBotMock.mockResolvedValue({ ok: true });
  });

  it('keeps bots that their call recording still references', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      truncated: false,
      bots: [
        buildCurrentWorkspaceBot({
          id: 'claimed-bot',
          twentyCallRecordingId: 'call-recording-1',
        }),
      ],
    });

    const result = await cancelOrphanedCallRecorders({
      client: buildClient([
        {
          id: 'call-recording-1',
          recordingRequestStatus: 'REQUESTED',
          externalBotId: 'claimed-bot',
        },
      ]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      canceledExternalBotIds: [],
      truncatedBotList: false,
    });
    expect(cancelRecallBotMock).not.toHaveBeenCalled();
  });

  it('lists only bots claimed by the current workspace', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      truncated: false,
      bots: [],
    });

    await cancelOrphanedCallRecorders({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(listScheduledRecallBotsMock).toHaveBeenCalledWith({
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
      metadata: { twentyWorkspaceId: CURRENT_WORKSPACE_ID },
    });
  });

  it('cancels bots whose call recording request was canceled locally', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      truncated: false,
      bots: [
        buildCurrentWorkspaceBot({
          id: 'stale-cancel-bot',
          twentyCallRecordingId: 'call-recording-1',
        }),
      ],
    });

    const result = await cancelOrphanedCallRecorders({
      client: buildClient([
        {
          id: 'call-recording-1',
          recordingRequestStatus: 'CANCELED',
          externalBotId: 'stale-cancel-bot',
        },
      ]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      canceledExternalBotIds: ['stale-cancel-bot'],
      truncatedBotList: false,
    });
    expect(cancelRecallBotMock).toHaveBeenCalledWith({
      externalBotId: 'stale-cancel-bot',
    });
  });

  it('cancels bots whose call recording references another bot', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      truncated: false,
      bots: [
        buildCurrentWorkspaceBot({
          id: 'superseded-bot',
          twentyCallRecordingId: 'call-recording-1',
        }),
        buildCurrentWorkspaceBot({
          id: 'claimed-bot',
          twentyCallRecordingId: 'call-recording-1',
        }),
      ],
    });

    const result = await cancelOrphanedCallRecorders({
      client: buildClient([
        {
          id: 'call-recording-1',
          recordingRequestStatus: 'REQUESTED',
          externalBotId: 'claimed-bot',
        },
      ]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 2,
      canceledExternalBotIds: ['superseded-bot'],
      truncatedBotList: false,
    });
    expect(cancelRecallBotMock).toHaveBeenCalledTimes(1);
    expect(cancelRecallBotMock).toHaveBeenCalledWith({
      externalBotId: 'superseded-bot',
    });
  });

  it('cancels bots whose call recording no longer exists', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      truncated: false,
      bots: [
        buildCurrentWorkspaceBot({
          id: 'orphan-bot',
          twentyCallRecordingId: 'call-recording-gone',
        }),
      ],
    });

    const result = await cancelOrphanedCallRecorders({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      canceledExternalBotIds: ['orphan-bot'],
      truncatedBotList: false,
    });
  });

  it('grants a grace round to requested recordings without a bot id yet', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      truncated: false,
      bots: [
        buildCurrentWorkspaceBot({
          id: 'pending-bot',
          twentyCallRecordingId: 'call-recording-1',
        }),
      ],
    });

    const result = await cancelOrphanedCallRecorders({
      client: buildClient([
        {
          id: 'call-recording-1',
          recordingRequestStatus: 'REQUESTED',
          externalBotId: null,
        },
      ]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      canceledExternalBotIds: [],
      truncatedBotList: false,
    });
    expect(cancelRecallBotMock).not.toHaveBeenCalled();
  });

  it('ignores bots that were not created by this app', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      truncated: false,
      bots: [buildBot({ id: 'unrelated-bot' })],
    });

    const result = await cancelOrphanedCallRecorders({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      canceledExternalBotIds: [],
      truncatedBotList: false,
    });
    expect(cancelRecallBotMock).not.toHaveBeenCalled();
  });

  it('ignores untagged bots even when they carry call recording metadata', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      truncated: false,
      bots: [
        buildBot({
          id: 'untagged-bot',
          twentyCallRecordingId: 'call-recording-gone',
        }),
      ],
    });

    const result = await cancelOrphanedCallRecorders({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      canceledExternalBotIds: [],
      truncatedBotList: false,
    });
    expect(cancelRecallBotMock).not.toHaveBeenCalled();
  });

  it('ignores bots claimed by another workspace', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      truncated: false,
      bots: [
        buildBot({
          id: 'other-workspace-bot',
          twentyCallRecordingId: 'call-recording-gone',
          twentyWorkspaceId: OTHER_WORKSPACE_ID,
        }),
      ],
    });

    const result = await cancelOrphanedCallRecorders({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      canceledExternalBotIds: [],
      truncatedBotList: false,
    });
    expect(cancelRecallBotMock).not.toHaveBeenCalled();
  });

  it('cancels orphaned bots claimed by this workspace', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      truncated: false,
      bots: [
        buildCurrentWorkspaceBot({
          id: 'same-workspace-bot',
          twentyCallRecordingId: 'call-recording-gone',
        }),
      ],
    });

    const result = await cancelOrphanedCallRecorders({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      canceledExternalBotIds: ['same-workspace-bot'],
      truncatedBotList: false,
    });
    expect(cancelRecallBotMock).toHaveBeenCalledWith({
      externalBotId: 'same-workspace-bot',
    });
  });

  it('ejects an orphaned bot that already joined when deletion is rejected', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      truncated: false,
      bots: [
        buildCurrentWorkspaceBot({
          id: 'in-call-orphan',
          twentyCallRecordingId: 'call-recording-gone',
        }),
      ],
    });
    cancelRecallBotMock.mockResolvedValue({
      ok: false,
      status: 409,
      errorMessage: 'Recall API responded with HTTP 409',
    });

    const result = await cancelOrphanedCallRecorders({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      canceledExternalBotIds: ['in-call-orphan'],
      truncatedBotList: false,
    });
    expect(ejectRecallBotMock).toHaveBeenCalledWith({
      externalBotId: 'in-call-orphan',
    });
  });

  it('reports a truncated bot list so partial scans are visible', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      truncated: true,
      bots: [
        buildCurrentWorkspaceBot({
          id: 'claimed-bot',
          twentyCallRecordingId: 'call-recording-1',
        }),
      ],
    });

    const result = await cancelOrphanedCallRecorders({
      client: buildClient([
        {
          id: 'call-recording-1',
          recordingRequestStatus: 'REQUESTED',
          externalBotId: 'claimed-bot',
        },
      ]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      canceledExternalBotIds: [],
      truncatedBotList: true,
    });
  });

  it('reports nothing canceled when listing Recall bots fails', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: false,
      status: 500,
      errorMessage: 'Recall API responded with HTTP 500',
    });

    const result = await cancelOrphanedCallRecorders({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 0,
      canceledExternalBotIds: [],
      truncatedBotList: false,
    });
    expect(cancelRecallBotMock).not.toHaveBeenCalled();
  });

  it('skips cancellation without listing bots when the current workspace cannot be resolved', async () => {
    getCurrentWorkspaceIdMock.mockReturnValue(undefined);

    const result = await cancelOrphanedCallRecorders({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 0,
      canceledExternalBotIds: [],
      truncatedBotList: false,
    });
    expect(listScheduledRecallBotsMock).not.toHaveBeenCalled();
    expect(cancelRecallBotMock).not.toHaveBeenCalled();
  });
});
