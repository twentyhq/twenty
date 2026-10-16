import { beforeEach, describe, expect, it, vi } from 'vitest';

const { client, enqueue, sync } = vi.hoisted(() => ({
  client: { query: vi.fn(), mutation: vi.fn() },
  enqueue: vi.fn(),
  sync: vi.fn(),
}));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    constructor() {
      return client;
    }
  },
}));
vi.mock('src/logic-functions/utils/enqueue-fathom-jobs-or-throw.util', () => ({
  enqueueFathomJobsOrThrow: enqueue,
}));
vi.mock(
  'src/logic-functions/utils/sync-call-recording-calendar-participant.util',
  () => ({ syncCallRecordingCalendarParticipant: sync }),
);

import { SYNC_CALL_RECORDING_CALENDAR_PARTICIPANT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { syncCallRecordingCalendarParticipantHandler } from 'src/logic-functions/sync-call-recording-calendar-participant';

const token = [
  'header',
  Buffer.from(JSON.stringify({ applicationId: 'app-id' })).toString(
    'base64url',
  ),
  'signature',
].join('.');

describe('calendar participant synchronization trigger', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', token);
  });

  it('uses the event ID and current source state instead of the event snapshot', async () => {
    await syncCallRecordingCalendarParticipantHandler({
      recordId: 'recording-id',
      properties: { after: { externalBotId: 'old-bot' } },
    });
    expect(sync).toHaveBeenCalledWith({
      client,
      applicationId: 'app-id',
      callRecordingId: 'recording-id',
    });
    expect(enqueue).not.toHaveBeenCalled();
  });

  it('backfills one page and enqueues the next page', async () => {
    client.query.mockResolvedValue({
      callRecordings: {
        edges: [{ node: { id: 'recording-id' } }],
        pageInfo: { hasNextPage: true, endCursor: 'next-page' },
      },
    });
    await syncCallRecordingCalendarParticipantHandler({});
    expect(enqueue).toHaveBeenCalledWith({
      logicFunctionUniversalIdentifier:
        SYNC_CALL_RECORDING_CALENDAR_PARTICIPANT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [{ recordId: 'recording-id' }, { after: 'next-page' }],
    });
  });

  it('stops at the last page', async () => {
    client.query.mockResolvedValue({
      callRecordings: { edges: [], pageInfo: { hasNextPage: false } },
    });
    await syncCallRecordingCalendarParticipantHandler({ after: 'last-page' });
    expect(enqueue).not.toHaveBeenCalled();
  });

  it('retries failed writes and invalid backfill cursors', async () => {
    sync.mockRejectedValue(new Error('API unavailable'));
    await expect(
      syncCallRecordingCalendarParticipantHandler({ recordId: 'id' }),
    ).rejects.toThrow('Calendar participant synchronization');
    client.query.mockResolvedValue({
      callRecordings: {
        edges: [],
        pageInfo: { hasNextPage: true, endCursor: 'same-page' },
      },
    });
    await expect(
      syncCallRecordingCalendarParticipantHandler({ after: 'same-page' }),
    ).rejects.toThrow('invalid cursor');
  });
});
