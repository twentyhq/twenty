import { describe, expect, it } from 'vitest';

import { parseGoogleMeetEventData } from 'src/logic-functions/utils/parse-google-meet-event-data.util';

const encode = (value: string) => Buffer.from(value).toString('base64');

describe('parseGoogleMeetEventData', () => {
  it('should decode the event Google sends', () => {
    expect(
      parseGoogleMeetEventData(
        encode(
          JSON.stringify({
            transcript: { name: 'conferenceRecords/first/transcripts/first' },
          }),
        ),
      ),
    ).toEqual({
      transcript: { name: 'conferenceRecords/first/transcripts/first' },
    });
  });

  it('should return an empty event for missing or unreadable data', () => {
    expect(parseGoogleMeetEventData(undefined)).toEqual({});
    expect(parseGoogleMeetEventData(encode('not json'))).toEqual({});
    expect(parseGoogleMeetEventData(encode('null'))).toEqual({});
  });
});
