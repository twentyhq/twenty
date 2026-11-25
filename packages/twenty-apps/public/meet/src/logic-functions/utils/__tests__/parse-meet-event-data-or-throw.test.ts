import { describe, expect, it } from 'vitest';

import { parseMeetEventDataOrThrow } from 'src/logic-functions/utils/parse-meet-event-data-or-throw.util';

const encode = (value: string) => Buffer.from(value).toString('base64');

describe('parseMeetEventDataOrThrow', () => {
  it('should decode the event Google sends', () => {
    expect(
      parseMeetEventDataOrThrow(
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
    expect(parseMeetEventDataOrThrow(undefined)).toEqual({});
  });

  it('should fail for data that is not JSON', () => {
    expect(() => parseMeetEventDataOrThrow(encode('not json'))).toThrow(
      expect.objectContaining({ code: 'EVENT_DATA_UNREADABLE' }),
    );
  });

  it('should fail for data that is not an object', () => {
    expect(() => parseMeetEventDataOrThrow(encode('null'))).toThrow(
      expect.objectContaining({ code: 'EVENT_DATA_UNREADABLE' }),
    );
  });
});
