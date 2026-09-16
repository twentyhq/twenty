import { describe, expect, it } from 'vitest';

import { readGoogleUpdateTime } from 'src/logic-functions/data/read-google-update-time.util';
import { type Person } from 'src/logic-functions/types/google-response.type';

const buildPerson = (updateTimes: (string | undefined)[]): Person => ({
  resourceName: 'people/1',
  metadata: { sources: updateTimes.map((updateTime) => ({ updateTime })) },
});

describe('readGoogleUpdateTime', () => {
  it('should return the only source update time', () => {
    expect(readGoogleUpdateTime(buildPerson(['2024-01-01T00:00:00Z']))).toBe(
      '2024-01-01T00:00:00Z',
    );
  });

  it('should return the most recent time across sources', () => {
    expect(
      readGoogleUpdateTime(
        buildPerson(['2024-01-01T00:00:00Z', '2024-03-01T00:00:00Z']),
      ),
    ).toBe('2024-03-01T00:00:00Z');
  });

  it('should ignore sources carrying no update time', () => {
    expect(
      readGoogleUpdateTime(buildPerson([undefined, '2024-01-01T00:00:00Z'])),
    ).toBe('2024-01-01T00:00:00Z');
  });

  it('should return nothing when no source carries a time', () => {
    expect(readGoogleUpdateTime(buildPerson([]))).toBeUndefined();
    expect(readGoogleUpdateTime({ resourceName: 'people/1' })).toBeUndefined();
  });
});
