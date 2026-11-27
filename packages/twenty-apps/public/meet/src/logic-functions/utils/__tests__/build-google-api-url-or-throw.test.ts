import { describe, expect, it } from 'vitest';

import { buildGoogleApiUrlOrThrow } from 'src/logic-functions/utils/build-google-api-url-or-throw.util';

const BASE_URL = 'https://meet.googleapis.com/v2';

describe('buildGoogleApiUrlOrThrow', () => {
  it('should build the resource URL with the defined query parameters', () => {
    expect(
      buildGoogleApiUrlOrThrow({
        baseUrl: BASE_URL,
        path: 'conferenceRecords/first/transcripts',
        queryParameters: { pageSize: '100', pageToken: undefined },
      }),
    ).toBe(
      'https://meet.googleapis.com/v2/conferenceRecords/first/transcripts?pageSize=100',
    );
  });

  it('should refuse a path that leaves the API', () => {
    expect(() =>
      buildGoogleApiUrlOrThrow({
        baseUrl: BASE_URL,
        path: '../../other',
        queryParameters: {},
      }),
    ).toThrow(expect.objectContaining({ code: 'INVALID_RESOURCE_PATH' }));
  });
});
