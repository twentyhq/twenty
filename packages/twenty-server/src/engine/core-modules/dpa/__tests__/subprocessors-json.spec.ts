import subprocessorsData from 'src/engine/core-modules/dpa/constants/subprocessors.json';
import { type SubprocessorList } from 'src/engine/core-modules/dpa/types/subprocessor.type';

describe('subprocessors.json integrity', () => {
  const { subprocessors } = subprocessorsData as SubprocessorList;

  it('has at least one sub-processor', () => {
    expect(subprocessors.length).toBeGreaterThan(0);
  });

  it('every entry has a name, services, processing locations and a pii flag', () => {
    for (const subprocessor of subprocessors) {
      expect(typeof subprocessor.name).toBe('string');
      expect(subprocessor.name.length).toBeGreaterThan(0);

      expect(Array.isArray(subprocessor.services)).toBe(true);
      expect(subprocessor.services.length).toBeGreaterThan(0);

      expect(Array.isArray(subprocessor.processingLocations)).toBe(true);
      expect(subprocessor.processingLocations.length).toBeGreaterThan(0);

      expect(typeof subprocessor.processesPii).toBe('boolean');
    }
  });

  it('is sorted by name so the synced diff stays stable', () => {
    const names = subprocessors.map((subprocessor) => subprocessor.name);
    const sorted = [...names].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

    expect(names).toEqual(sorted);
  });
});
