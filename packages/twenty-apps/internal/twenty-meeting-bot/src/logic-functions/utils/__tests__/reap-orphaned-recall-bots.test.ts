import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { reapOrphanedRecallBots } from 'src/logic-functions/utils/reap-orphaned-recall-bots.util';

const listScheduledRecallBotsMock = vi.hoisted(() => vi.fn());
const cancelRecallRecordingBotMock = vi.hoisted(() => vi.fn());
const ejectRecallRecordingBotMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/utils/list-scheduled-recall-bots.util', () => ({
  listScheduledRecallBots: listScheduledRecallBotsMock,
}));

vi.mock('src/logic-functions/utils/cancel-recall-recording-bot.util', () => ({
  cancelRecallRecordingBot: cancelRecallRecordingBotMock,
}));

vi.mock('src/logic-functions/utils/eject-recall-recording-bot.util', () => ({
  ejectRecallRecordingBot: ejectRecallRecordingBotMock,
}));

const JOIN_AT_AFTER = '2026-01-01T08:00:00.000Z';
const JOIN_AT_BEFORE = '2026-01-02T12:00:00.000Z';

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

const buildBot = (id: string, twentyCallRecordingId?: string) => ({
  id,
  metadata:
    twentyCallRecordingId === undefined ? {} : { twentyCallRecordingId },
});

describe('reapOrphanedRecallBots', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    listScheduledRecallBotsMock.mockReset();
    cancelRecallRecordingBotMock.mockReset();
    cancelRecallRecordingBotMock.mockResolvedValue({ ok: true });
    ejectRecallRecordingBotMock.mockReset();
    ejectRecallRecordingBotMock.mockResolvedValue({ ok: true });
  });

  it('keeps bots that their call recording still references', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      bots: [buildBot('claimed-bot', 'call-recording-1')],
    });

    const result = await reapOrphanedRecallBots({
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
    });
    expect(cancelRecallRecordingBotMock).not.toHaveBeenCalled();
  });

  it('cancels bots whose call recording request was canceled locally', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      bots: [buildBot('stale-cancel-bot', 'call-recording-1')],
    });

    const result = await reapOrphanedRecallBots({
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
    });
    expect(cancelRecallRecordingBotMock).toHaveBeenCalledWith({
      externalBotId: 'stale-cancel-bot',
    });
  });

  it('cancels bots whose call recording references another bot', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      bots: [
        buildBot('superseded-bot', 'call-recording-1'),
        buildBot('claimed-bot', 'call-recording-1'),
      ],
    });

    const result = await reapOrphanedRecallBots({
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
    });
    expect(cancelRecallRecordingBotMock).toHaveBeenCalledTimes(1);
    expect(cancelRecallRecordingBotMock).toHaveBeenCalledWith({
      externalBotId: 'superseded-bot',
    });
  });

  it('cancels bots whose call recording no longer exists', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      bots: [buildBot('orphan-bot', 'call-recording-gone')],
    });

    const result = await reapOrphanedRecallBots({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      canceledExternalBotIds: ['orphan-bot'],
    });
  });

  it('grants a grace round to requested recordings without a bot id yet', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      bots: [buildBot('pending-bot', 'call-recording-1')],
    });

    const result = await reapOrphanedRecallBots({
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
    });
    expect(cancelRecallRecordingBotMock).not.toHaveBeenCalled();
  });

  it('ignores bots that were not created by this app', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      bots: [buildBot('unrelated-bot')],
    });

    const result = await reapOrphanedRecallBots({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      canceledExternalBotIds: [],
    });
    expect(cancelRecallRecordingBotMock).not.toHaveBeenCalled();
  });

  it('ejects an orphaned bot that already joined when deletion is rejected', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      bots: [buildBot('in-call-orphan', 'call-recording-gone')],
    });
    cancelRecallRecordingBotMock.mockResolvedValue({
      ok: false,
      status: 409,
      errorMessage: 'Recall API responded with HTTP 409',
    });

    const result = await reapOrphanedRecallBots({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      canceledExternalBotIds: ['in-call-orphan'],
    });
    expect(ejectRecallRecordingBotMock).toHaveBeenCalledWith({
      externalBotId: 'in-call-orphan',
    });
  });

  it('reports nothing reaped when listing Recall bots fails', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: false,
      status: 500,
      errorMessage: 'Recall API responded with HTTP 500',
    });

    const result = await reapOrphanedRecallBots({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 0,
      canceledExternalBotIds: [],
    });
    expect(cancelRecallRecordingBotMock).not.toHaveBeenCalled();
  });
});
