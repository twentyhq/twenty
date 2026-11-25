import { getConnection } from 'twenty-sdk/logic-function';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { meetQueueConferenceImportsHandler } from 'src/logic-functions/meet-queue-conference-imports';
import { enqueueMeetConferenceImportsOrThrow } from 'src/logic-functions/utils/enqueue-meet-conference-imports-or-throw.util';
import { listMeetConferenceRecords } from 'src/logic-functions/utils/list-meet-conference-records.util';

vi.mock('twenty-sdk/logic-function', () => ({ getConnection: vi.fn() }));

vi.mock(
  'src/logic-functions/utils/list-meet-conference-records.util',
  () => ({ listMeetConferenceRecords: vi.fn() }),
);

vi.mock(
  'src/logic-functions/utils/enqueue-meet-conference-imports-or-throw.util',
  () => ({ enqueueMeetConferenceImportsOrThrow: vi.fn() }),
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

describe('meetQueueConferenceImportsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.mocked(getConnection, { partial: true }).mockResolvedValue({
      id: 'connected-account-id',
      accessToken: 'token',
    });
    vi.mocked(listMeetConferenceRecords).mockResolvedValue([
      ENDED_CONFERENCE_RECORD,
      ONGOING_CONFERENCE_RECORD,
    ]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should queue the ended conferences that started in the last fifty hours', async () => {
    await expect(
      meetQueueConferenceImportsHandler({
        connectedAccountId: 'connected-account-id',
      }),
    ).resolves.toEqual({ success: true, queuedCount: 1, ongoingCount: 1 });

    expect(getConnection).toHaveBeenCalledExactlyOnceWith(
      'connected-account-id',
    );
    expect(listMeetConferenceRecords).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      startedAfter: new Date('2026-11-15T08:15:00Z'),
      startedBefore: NOW,
    });
    expect(
      enqueueMeetConferenceImportsOrThrow,
    ).toHaveBeenCalledExactlyOnceWith({
      connectedAccountId: 'connected-account-id',
      conferenceRecords: [ENDED_CONFERENCE_RECORD],
      now: NOW,
    });
  });

  it('should refuse a job without connection', async () => {
    await expect(meetQueueConferenceImportsHandler({})).resolves.toEqual({
      success: false,
      error: 'Invalid Google Meet conference discovery job',
    });

    expect(getConnection).not.toHaveBeenCalled();
    expect(listMeetConferenceRecords).not.toHaveBeenCalled();
    expect(enqueueMeetConferenceImportsOrThrow).not.toHaveBeenCalled();
  });
});
