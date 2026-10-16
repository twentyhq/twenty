import { beforeEach, describe, expect, it, vi } from 'vitest';

const { client, enqueue, sync, clientOptions } = vi.hoisted(() => ({
  clientOptions: vi.fn(),
  client: { query: vi.fn(), mutation: vi.fn() },
  enqueue: vi.fn(),
  sync: vi.fn(),
}));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    constructor(options: unknown) {
      clientOptions(options);
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

import {
  BACKFILL_CALENDAR_PARTICIPANTS_BATCH_UNIVERSAL_IDENTIFIER,
  SYNC_CALL_RECORDING_CALENDAR_PARTICIPANT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { syncCallRecordingCalendarParticipantHandler } from 'src/logic-functions/sync-call-recording-calendar-participant';

import { backfillCalendarParticipantsBatchHandler } from 'src/logic-functions/backfill-calendar-participants-batch';

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
      properties: {
        after: { externalBotId: 'old-bot', applicationId: 'app-id' },
      },
    });
    expect(clientOptions).toHaveBeenCalledWith({ runAs: 'application' });
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
    await backfillCalendarParticipantsBatchHandler({});
    expect(enqueue).toHaveBeenCalledWith({
      logicFunctionUniversalIdentifier:
        SYNC_CALL_RECORDING_CALENDAR_PARTICIPANT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [{ recordId: 'recording-id' }],
    });
    expect(enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunctionUniversalIdentifier:
          BACKFILL_CALENDAR_PARTICIPANTS_BATCH_UNIVERSAL_IDENTIFIER,
        payloads: [{ after: 'next-page' }],
      }),
    );
  });

  it('stops at the last page', async () => {
    client.query.mockResolvedValue({
      callRecordings: { edges: [], pageInfo: { hasNextPage: false } },
    });
    await backfillCalendarParticipantsBatchHandler({ after: 'last-page' });
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
      backfillCalendarParticipantsBatchHandler({ after: 'same-page' }),
    ).rejects.toThrow('invalid cursor');
  });
  it('ignores deletion events from another recording app', async () => {
    await syncCallRecordingCalendarParticipantHandler({
      recordId: 'other-recording',
      properties: { before: { applicationId: 'other-app' } },
    });
    expect(sync).not.toHaveBeenCalled();
    expect(enqueue).not.toHaveBeenCalled();
  });
});
