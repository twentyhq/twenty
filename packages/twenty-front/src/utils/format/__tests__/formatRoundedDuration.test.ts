import { formatRoundedDuration } from '~/utils/format/formatRoundedDuration';

describe('formatRoundedDuration', () => {
  it.each<[number, string]>([
    [0, '0s'],
    [1_400, '1s'],
    [12_400, '12s'],
    [59_600, '1m'],
    [83_000, '1m 23s'],
    [120_000, '2m'],
    [3_600_000, '1h'],
    [3_960_000, '1h 6m'],
    [86_400_000, '1d'],
    [93_600_000, '1d 2h'],
  ])('formats %sms as %s', (durationMs, expected) => {
    expect(formatRoundedDuration(durationMs)).toBe(expected);
  });
});
