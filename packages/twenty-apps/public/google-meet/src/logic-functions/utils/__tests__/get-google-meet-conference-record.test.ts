import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchGoogleMeetJson } from 'src/logic-functions/utils/fetch-google-meet-json.util';
import { getGoogleMeetConferenceRecord } from 'src/logic-functions/utils/get-google-meet-conference-record.util';

vi.mock('src/logic-functions/utils/fetch-google-meet-json.util', () => ({
  fetchGoogleMeetJson: vi.fn(),
}));

const CONFERENCE_RECORD = {
  name: 'conferenceRecords/first',
  startTime: '2026-11-17T09:00:00Z',
};

describe('getGoogleMeetConferenceRecord', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch the conference by name', async () => {
    vi.mocked(fetchGoogleMeetJson).mockResolvedValue(CONFERENCE_RECORD);

    await expect(
      getGoogleMeetConferenceRecord({
        accessToken: 'token',
        conferenceRecordName: 'conferenceRecords/first',
      }),
    ).resolves.toEqual(CONFERENCE_RECORD);

    expect(fetchGoogleMeetJson).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      url: 'https://meet.googleapis.com/v2/conferenceRecords/first',
    });
  });
});
