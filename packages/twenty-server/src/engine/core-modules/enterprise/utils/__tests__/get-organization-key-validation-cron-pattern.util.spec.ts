import { getOrganizationKeyValidationCronPattern } from 'src/engine/core-modules/enterprise/utils/get-organization-key-validation-cron-pattern.util';

describe('getOrganizationKeyValidationCronPattern', () => {
  it('keeps a server on the same daily minute after a restart', () => {
    expect(getOrganizationKeyValidationCronPattern('server-production')).toBe(
      getOrganizationKeyValidationCronPattern('server-production'),
    );
  });

  it('spreads servers across the 04:00–04:59 UTC hour', () => {
    const minutes = new Set<number>();

    for (let index = 0; index < 1000; index++) {
      const pattern = getOrganizationKeyValidationCronPattern(
        `server-${index}`,
      );

      expect(pattern).toMatch(/^\d{1,2} 4 \* \* \*$/);

      const minute = Number(pattern.split(' ')[0]);

      expect(minute).toBeGreaterThanOrEqual(0);
      expect(minute).toBeLessThan(60);
      minutes.add(minute);
    }

    expect(minutes.size).toBeGreaterThan(50);
  });

  it('keeps refreshing if a server ID cannot be persisted', () => {
    expect(getOrganizationKeyValidationCronPattern(null)).toBe('0 4 * * *');
  });
});
