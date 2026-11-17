import { describe, expect, it } from 'vitest';

import { parseGoogleMeetEventDataOrThrow } from 'src/logic-functions/utils/parse-google-meet-event-data-or-throw.util';

const encode = (value: string) => Buffer.from(value).toString('base64');

describe('parseGoogleMeetEventDataOrThrow', () => {
  it('should decode the event Google sends', () => {
    expect(
      parseGoogleMeetEventDataOrThrow(
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

  it('should return an empty event for a message without data', () => {
    expect(parseGoogleMeetEventDataOrThrow(undefined)).toEqual({});
  });

  it('should fail for data that is not JSON', () => {
    expect(() => parseGoogleMeetEventDataOrThrow(encode('not json'))).toThrow(
      expect.objectContaining({ code: 'EVENT_DATA_UNREADABLE' }),
    );
  });

  it('should fail for data that is not an object', () => {
    expect(() => parseGoogleMeetEventDataOrThrow(encode('null'))).toThrow(
      expect.objectContaining({ code: 'EVENT_DATA_UNREADABLE' }),
    );
  });
});
