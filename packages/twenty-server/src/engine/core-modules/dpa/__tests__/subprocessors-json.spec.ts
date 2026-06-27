import subprocessorsData from 'src/engine/core-modules/dpa/constants/subprocessors.json';
import { type SubprocessorList } from 'src/engine/core-modules/dpa/types/subprocessor.type';

// subprocessors.json is generated from the Trust Center by
// scripts/dpa-sync-subprocessors.ts. These checks guard the shape the DPA's
// Annex C renderer relies on, and the stable ordering the sync depends on.
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
    const sorted = [...names].sort((a, b) => a.localeCompare(b));

    expect(names).toEqual(sorted);
  });
});
