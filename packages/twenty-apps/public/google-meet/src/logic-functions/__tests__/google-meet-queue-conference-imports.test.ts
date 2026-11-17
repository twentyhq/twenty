import { getConnection } from 'twenty-sdk/logic-function';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { googleMeetQueueConferenceImportsHandler } from 'src/logic-functions/google-meet-queue-conference-imports';
import { enqueueGoogleMeetConferenceImportsOrThrow } from 'src/logic-functions/utils/enqueue-google-meet-conference-imports-or-throw.util';
import { listGoogleMeetConferenceRecords } from 'src/logic-functions/utils/list-google-meet-conference-records.util';

vi.mock('twenty-sdk/logic-function', () => ({ getConnection: vi.fn() }));

vi.mock(
  'src/logic-functions/utils/list-google-meet-conference-records.util',
  () => ({ listGoogleMeetConferenceRecords: vi.fn() }),
);

vi.mock(
  'src/logic-functions/utils/enqueue-google-meet-conference-imports-or-throw.util',
  () => ({ enqueueGoogleMeetConferenceImportsOrThrow: vi.fn() }),
);

const NOW = new Date('2026-11-17T10:15:00Z');

const ENDED_CONFERENCE_RECORD = {
  name: 'conferenceRecords/ended',
  startTime: '2026-11-17T09:00:00Z',
  endTime: '2026-11-17T09:30:00Z',
};

const ONGOING_CONFERENCE_RECORD = {
  name: 'conferenceRecords/ongoing',
  startTime: '2026-11-17T10:00:00Z',
};

describe('googleMeetQueueConferenceImportsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.mocked(getConnection, { partial: true }).mockResolvedValue({
      id: 'connected-account-id',
      accessToken: 'token',
    });
    vi.mocked(listGoogleMeetConferenceRecords).mockResolvedValue([
      ENDED_CONFERENCE_RECORD,
      ONGOING_CONFERENCE_RECORD,
    ]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should queue the ended conferences that started in the last fifty hours', async () => {
    await expect(
      googleMeetQueueConferenceImportsHandler({
        connectedAccountId: 'connected-account-id',
      }),
    ).resolves.toEqual({ success: true, queuedCount: 1, ongoingCount: 1 });

    expect(getConnection).toHaveBeenCalledExactlyOnceWith(
      'connected-account-id',
    );
    expect(listGoogleMeetConferenceRecords).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      startedAfter: new Date('2026-11-15T08:15:00Z'),
      startedBefore: NOW,
    });
    expect(
      enqueueGoogleMeetConferenceImportsOrThrow,
    ).toHaveBeenCalledExactlyOnceWith({
      connectedAccountId: 'connected-account-id',
      conferenceRecords: [ENDED_CONFERENCE_RECORD],
      now: NOW,
    });
  });

  it('should refuse a job without connection', async () => {
    await expect(googleMeetQueueConferenceImportsHandler({})).resolves.toEqual({
      success: false,
      error: 'Invalid Google Meet conference discovery job',
    });

    expect(getConnection).not.toHaveBeenCalled();
    expect(listGoogleMeetConferenceRecords).not.toHaveBeenCalled();
    expect(enqueueGoogleMeetConferenceImportsOrThrow).not.toHaveBeenCalled();
  });
});
