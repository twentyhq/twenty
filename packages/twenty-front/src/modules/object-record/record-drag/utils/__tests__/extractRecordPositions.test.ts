import { extractRecordPositions } from '@/object-record/record-drag/utils/extractRecordPositions';
import { type Snapshot } from 'recoil';

import { isDefined } from 'twenty-shared/utils';

describe('extractRecordPositions', () => {
  const createMockSnapshot = (recordData: Record<string, any>): Snapshot => {
    return {
      getLoadable: (atom: any) => {
        const match = atom.key.match(/recordStoreFamilyState__"([^"]+)"/);
        const recordId = match ? match[1] : atom.key;
        if (isDefined(recordData[recordId])) {
          return {
            getValue: () => recordData[recordId],
            state: 'hasValue',
          };
        }
        return {
          getValue: () => undefined,
          state: 'hasValue',
        };
      },
    } as unknown as Snapshot;
  };

  it('should extract position data from records in snapshot', () => {
    const mockRecordData = {
      'record-1': { id: 'record-1', position: 1, name: 'Record 1' },
      'record-2': { id: 'record-2', position: 2, name: 'Record 2' },
      'record-3': { id: 'record-3', position: 3, name: 'Record 3' },
    };

    const snapshot = createMockSnapshot(mockRecordData);
    const allRecordIds = ['record-1', 'record-2', 'record-3'];

    const result = extractRecordPositions(allRecordIds, snapshot);

    expect(result).toEqual([
      { id: 'record-1', position: 1 },
      { id: 'record-2', position: 2 },
      { id: 'record-3', position: 3 },
    ]);
  });

  it('should handle records with undefined positions', () => {
    const mockRecordData = {
      'record-1': { id: 'record-1', position: 1 },
      'record-2': { id: 'record-2' },
      'record-3': { id: 'record-3', position: undefined },
    };

    const snapshot = createMockSnapshot(mockRecordData);
    const allRecordIds = ['record-1', 'record-2', 'record-3'];

    const result = extractRecordPositions(allRecordIds, snapshot);

    expect(result).toEqual([
      { id: 'record-1', position: 1 },
      { id: 'record-2', position: undefined },
      { id: 'record-3', position: undefined },
    ]);
  });

  it('should handle non-existent records', () => {
    const mockRecordData = {
      'record-1': { id: 'record-1', position: 1 },
    };

    const snapshot = createMockSnapshot(mockRecordData);
    const allRecordIds = ['record-1', 'record-2', 'non-existent'];

    const result = extractRecordPositions(allRecordIds, snapshot);

    expect(result).toEqual([
      { id: 'record-1', position: 1 },
      { id: 'record-2', position: undefined },
      { id: 'non-existent', position: undefined },
    ]);
  });

  it('should handle empty record list', () => {
    const snapshot = createMockSnapshot({});
    const allRecordIds: string[] = [];

    const result = extractRecordPositions(allRecordIds, snapshot);

    expect(result).toEqual([]);
  });

  it('should preserve order of input record IDs', () => {
    const mockRecordData = {
      'record-1': { id: 'record-1', position: 100 },
      'record-2': { id: 'record-2', position: 50 },
      'record-3': { id: 'record-3', position: 75 },
    };

    const snapshot = createMockSnapshot(mockRecordData);
    const allRecordIds = ['record-3', 'record-1', 'record-2'];

    const result = extractRecordPositions(allRecordIds, snapshot);

    expect(result).toEqual([
      { id: 'record-3', position: 75 },
      { id: 'record-1', position: 100 },
      { id: 'record-2', position: 50 },
    ]);
  });

  it('should handle null positions', () => {
    const mockRecordData = {
      'record-1': { id: 'record-1', position: null },
      'record-2': { id: 'record-2', position: 2 },
    };

    const snapshot = createMockSnapshot(mockRecordData);
    const allRecordIds = ['record-1', 'record-2'];

    const result = extractRecordPositions(allRecordIds, snapshot);

    expect(result).toEqual([
      { id: 'record-1', position: null },
      { id: 'record-2', position: 2 },
    ]);
  });

  it('should handle negative positions', () => {
    const mockRecordData = {
      'record-1': { id: 'record-1', position: -5 },
      'record-2': { id: 'record-2', position: -10 },
    };

    const snapshot = createMockSnapshot(mockRecordData);
    const allRecordIds = ['record-1', 'record-2'];

    const result = extractRecordPositions(allRecordIds, snapshot);

    expect(result).toEqual([
      { id: 'record-1', position: -5 },
      { id: 'record-2', position: -10 },
    ]);
  });

  it('should handle decimal positions', () => {
    const mockRecordData = {
      'record-1': { id: 'record-1', position: 1.5 },
      'record-2': { id: 'record-2', position: 2.75 },
    };

    const snapshot = createMockSnapshot(mockRecordData);
    const allRecordIds = ['record-1', 'record-2'];

    const result = extractRecordPositions(allRecordIds, snapshot);

    expect(result).toEqual([
      { id: 'record-1', position: 1.5 },
      { id: 'record-2', position: 2.75 },
    ]);
  });
});
