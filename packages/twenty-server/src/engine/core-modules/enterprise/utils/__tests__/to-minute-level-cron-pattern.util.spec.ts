import { toMinuteLevelCronPattern } from 'src/engine/core-modules/enterprise/utils/to-minute-level-cron-pattern.util';

describe('toMinuteLevelCronPattern', () => {
  it('drops the seconds field of a six-field pattern', () => {
    expect(toMinuteLevelCronPattern('37 12 9 * * *')).toBe('12 9 * * *');
  });

  it('keeps a five-field pattern as it is', () => {
    expect(toMinuteLevelCronPattern('0 4 * * *')).toBe('0 4 * * *');
  });
});
