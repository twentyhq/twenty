import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { APPLICATION_ID_ENV_VAR_NAME } from 'src/logic-functions/constants/application-id-env-var-name';
import { reapOrphanedMeetingBots } from 'src/logic-functions/flows/reap-orphaned-meeting-bots.util';

const listScheduledRecallBotsMock = vi.hoisted(() => vi.fn());
const cancelRecallBotMock = vi.hoisted(() => vi.fn());
const ejectRecallBotMock = vi.hoisted(() => vi.fn());

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
const CURRENT_APPLICATION_ID = 'current-application-id';
const ORIGINAL_APPLICATION_ID = process.env[APPLICATION_ID_ENV_VAR_NAME];

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

const restoreOriginalApplicationId = () => {
  if (ORIGINAL_APPLICATION_ID === undefined) {
    delete process.env[APPLICATION_ID_ENV_VAR_NAME];

    return;
  }

  process.env[APPLICATION_ID_ENV_VAR_NAME] = ORIGINAL_APPLICATION_ID;
};

const buildBot = ({
  id,
  twentyCallRecordingId,
  twentyApplicationId,
}: {
  id: string;
  twentyCallRecordingId?: string;
  twentyApplicationId?: string;
}) => ({
  id,
  metadata: {
    ...(twentyCallRecordingId === undefined ? {} : { twentyCallRecordingId }),
    ...(twentyApplicationId === undefined ? {} : { twentyApplicationId }),
  },
});

const buildCurrentApplicationBot = ({
  id,
  twentyCallRecordingId,
}: {
  id: string;
  twentyCallRecordingId: string;
}) =>
  buildBot({
    id,
    twentyCallRecordingId,
    twentyApplicationId: CURRENT_APPLICATION_ID,
  });

describe('reapOrphanedMeetingBots', () => {
  beforeEach(() => {
    restoreOriginalApplicationId();
    process.env[APPLICATION_ID_ENV_VAR_NAME] = CURRENT_APPLICATION_ID;
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    listScheduledRecallBotsMock.mockReset();
    cancelRecallBotMock.mockReset();
    cancelRecallBotMock.mockResolvedValue({ ok: true });
    ejectRecallBotMock.mockReset();
    ejectRecallBotMock.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    restoreOriginalApplicationId();
  });

  it('keeps bots that their call recording still references', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      bots: [
        buildCurrentApplicationBot({
          id: 'claimed-bot',
          twentyCallRecordingId: 'call-recording-1',
        }),
      ],
    });

    const result = await reapOrphanedMeetingBots({
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
    expect(cancelRecallBotMock).not.toHaveBeenCalled();
  });

  it('cancels bots whose call recording request was canceled locally', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      bots: [
        buildCurrentApplicationBot({
          id: 'stale-cancel-bot',
          twentyCallRecordingId: 'call-recording-1',
        }),
      ],
    });

    const result = await reapOrphanedMeetingBots({
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
    expect(cancelRecallBotMock).toHaveBeenCalledWith({
      externalBotId: 'stale-cancel-bot',
    });
  });

  it('cancels bots whose call recording references another bot', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      bots: [
        buildCurrentApplicationBot({
          id: 'superseded-bot',
          twentyCallRecordingId: 'call-recording-1',
        }),
        buildCurrentApplicationBot({
          id: 'claimed-bot',
          twentyCallRecordingId: 'call-recording-1',
        }),
      ],
    });

    const result = await reapOrphanedMeetingBots({
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
    expect(cancelRecallBotMock).toHaveBeenCalledTimes(1);
    expect(cancelRecallBotMock).toHaveBeenCalledWith({
      externalBotId: 'superseded-bot',
    });
  });

  it('cancels bots whose call recording no longer exists', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      bots: [
        buildCurrentApplicationBot({
          id: 'orphan-bot',
          twentyCallRecordingId: 'call-recording-gone',
        }),
      ],
    });

    const result = await reapOrphanedMeetingBots({
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
      bots: [
        buildCurrentApplicationBot({
          id: 'pending-bot',
          twentyCallRecordingId: 'call-recording-1',
        }),
      ],
    });

    const result = await reapOrphanedMeetingBots({
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
    expect(cancelRecallBotMock).not.toHaveBeenCalled();
  });

  it('ignores bots that were not created by this app', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      bots: [buildBot({ id: 'unrelated-bot' })],
    });

    const result = await reapOrphanedMeetingBots({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      canceledExternalBotIds: [],
    });
    expect(cancelRecallBotMock).not.toHaveBeenCalled();
  });

  it('ignores untagged bots even when they carry call recording metadata', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      bots: [
        buildBot({
          id: 'untagged-bot',
          twentyCallRecordingId: 'call-recording-gone',
        }),
      ],
    });

    const result = await reapOrphanedMeetingBots({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      canceledExternalBotIds: [],
    });
    expect(cancelRecallBotMock).not.toHaveBeenCalled();
  });

  it('ignores bots claimed by another application registration', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      bots: [
        buildBot({
          id: 'other-app-bot',
          twentyCallRecordingId: 'call-recording-gone',
          twentyApplicationId: 'other-application-id',
        }),
      ],
    });

    const result = await reapOrphanedMeetingBots({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      canceledExternalBotIds: [],
    });
    expect(cancelRecallBotMock).not.toHaveBeenCalled();
  });

  it('cancels orphaned bots claimed by this application registration', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      bots: [
        buildCurrentApplicationBot({
          id: 'same-app-bot',
          twentyCallRecordingId: 'call-recording-gone',
        }),
      ],
    });

    const result = await reapOrphanedMeetingBots({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      canceledExternalBotIds: ['same-app-bot'],
    });
    expect(cancelRecallBotMock).toHaveBeenCalledWith({
      externalBotId: 'same-app-bot',
    });
  });

  it('ejects an orphaned bot that already joined when deletion is rejected', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      bots: [
        buildCurrentApplicationBot({
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

    const result = await reapOrphanedMeetingBots({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      canceledExternalBotIds: ['in-call-orphan'],
    });
    expect(ejectRecallBotMock).toHaveBeenCalledWith({
      externalBotId: 'in-call-orphan',
    });
  });

  it('reports nothing reaped when listing Recall bots fails', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: false,
      status: 500,
      errorMessage: 'Recall API responded with HTTP 500',
    });

    const result = await reapOrphanedMeetingBots({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 0,
      canceledExternalBotIds: [],
    });
    expect(cancelRecallBotMock).not.toHaveBeenCalled();
  });
});
