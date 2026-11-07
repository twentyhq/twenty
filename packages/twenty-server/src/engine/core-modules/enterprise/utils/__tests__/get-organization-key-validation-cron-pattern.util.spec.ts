import { getOrganizationKeyValidationCronPattern } from 'src/engine/core-modules/enterprise/utils/get-organization-key-validation-cron-pattern.util';

describe('getOrganizationKeyValidationCronPattern', () => {
  it('keeps a server on the same daily time after a restart', () => {
    expect(getOrganizationKeyValidationCronPattern('server-production')).toBe(
      getOrganizationKeyValidationCronPattern('server-production'),
    );
  });

  it('spreads servers across the whole day, down to the second', () => {
    const hours = new Set<number>();
    const seconds = new Set<number>();

    for (let index = 0; index < 1000; index++) {
      const pattern = getOrganizationKeyValidationCronPattern(
        `server-${index}`,
      );

      expect(pattern).toMatch(/^\d{1,2} \d{1,2} \d{1,2} \* \* \*$/);

      const [second, minute, hour] = pattern.split(' ').map(Number);

      expect(second).toBeLessThan(60);
      expect(minute).toBeLessThan(60);
      expect(hour).toBeLessThan(24);
      hours.add(hour);
      seconds.add(second);
    }

    expect(hours.size).toBe(24);
    expect(seconds.size).toBeGreaterThan(50);
  });

  it('keeps refreshing if a server ID cannot be persisted', () => {
    expect(getOrganizationKeyValidationCronPattern(null)).toBe('0 4 * * *');
  });
});
