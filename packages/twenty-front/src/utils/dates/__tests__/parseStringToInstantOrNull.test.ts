import { parseStringToInstantOrNull } from '~/utils/dates/parseStringToInstantOrNull';

describe('parseStringToInstantOrNull', () => {
  it('should parse a full ISO instant with Z', () => {
    expect(parseStringToInstantOrNull('2026-05-07T12:00:00Z')?.toString()).toBe(
      '2026-05-07T12:00:00Z',
    );
  });

  it('should parse a full ISO instant with offset and convert to UTC', () => {
    expect(
      parseStringToInstantOrNull('2026-05-07T12:00:00+02:00')?.toString(),
    ).toBe('2026-05-07T10:00:00Z');
  });

  it('should interpret a date-only value as start-of-day UTC instead of throwing', () => {
    expect(parseStringToInstantOrNull('2026-05-07')?.toString()).toBe(
      '2026-05-07T00:00:00Z',
    );
  });

  it('should return null for an unparseable value', () => {
    expect(parseStringToInstantOrNull('not-a-date')).toBeNull();
  });
});
