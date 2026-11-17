import { describe, expect, it } from 'vitest';

import { buildGoogleMeetUrlOrThrow } from 'src/logic-functions/utils/build-google-meet-url-or-throw.util';

describe('buildGoogleMeetUrlOrThrow', () => {
  it('should build the resource URL with the defined query parameters', () => {
    expect(
      buildGoogleMeetUrlOrThrow({
        path: 'conferenceRecords/first/transcripts',
        queryParameters: { pageSize: '100', pageToken: undefined },
      }),
    ).toBe(
      'https://meet.googleapis.com/v2/conferenceRecords/first/transcripts?pageSize=100',
    );
  });

  it('should refuse a path that leaves the Meet API', () => {
    expect(() =>
      buildGoogleMeetUrlOrThrow({ path: '../../other', queryParameters: {} }),
    ).toThrow(expect.objectContaining({ code: 'INVALID_RESOURCE_PATH' }));
  });
});
