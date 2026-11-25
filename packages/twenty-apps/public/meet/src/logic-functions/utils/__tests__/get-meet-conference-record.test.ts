import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchMeetJson } from 'src/logic-functions/utils/fetch-meet-json.util';
import { getMeetConferenceRecord } from 'src/logic-functions/utils/get-meet-conference-record.util';

vi.mock('src/logic-functions/utils/fetch-meet-json.util', () => ({
  fetchMeetJson: vi.fn(),
}));

const CONFERENCE_RECORD = {
  name: 'conferenceRecords/first',
  startTime: '2026-11-17T09:00:00Z',
};

describe('getMeetConferenceRecord', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch the conference by name', async () => {
    vi.mocked(fetchMeetJson).mockResolvedValue(CONFERENCE_RECORD);

    await expect(
      getMeetConferenceRecord({
        accessToken: 'token',
        conferenceRecordName: 'conferenceRecords/first',
      }),
    ).resolves.toEqual(CONFERENCE_RECORD);

    expect(fetchMeetJson).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      url: 'https://meet.googleapis.com/v2/conferenceRecords/first',
    });
  });
});
