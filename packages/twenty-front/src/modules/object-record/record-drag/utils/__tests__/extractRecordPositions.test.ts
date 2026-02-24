import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { extractRecordPositions } from '@/object-record/record-drag/utils/extractRecordPositions';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const setMockRecordData = (
  recordData: Record<string, Record<string, unknown>>,
) => {
  for (const [recordId, record] of Object.entries(recordData)) {
    jotaiStore.set(recordStoreFamilyState.atomFamily(recordId), {
      ...record,
      id: recordId,
      __typename: 'Record',
    } as ObjectRecord);
  }
};

describe('extractRecordPositions', () => {
  it('should extract position data from records in store', () => {
    const mockRecordData: Record<string, Record<string, unknown>> = {
      'record-1': { id: 'record-1', position: 1, name: 'Record 1' },
      'record-2': { id: 'record-2', position: 2, name: 'Record 2' },
      'record-3': { id: 'record-3', position: 3, name: 'Record 3' },
    };

    setMockRecordData(mockRecordData);
    const allRecordIds = ['record-1', 'record-2', 'record-3'];

    const result = extractRecordPositions(allRecordIds, jotaiStore);

    expect(result).toEqual([
      { id: 'record-1', position: 1 },
      { id: 'record-2', position: 2 },
      { id: 'record-3', position: 3 },
    ]);
  });

  it('should handle records with undefined positions', () => {
    const mockRecordData: Record<string, Record<string, unknown>> = {
      'record-1': { id: 'record-1', position: 1 },
      'record-2': { id: 'record-2' },
      'record-3': { id: 'record-3', position: undefined },
    };

    setMockRecordData(mockRecordData);
    const allRecordIds = ['record-1', 'record-2', 'record-3'];

    const result = extractRecordPositions(allRecordIds, jotaiStore);

    expect(result).toEqual([
      { id: 'record-1', position: 1 },
      { id: 'record-2', position: 0 },
      { id: 'record-3', position: 0 },
    ]);
  });

  it('should handle non-existent records', () => {
    const mockRecordData: Record<string, Record<string, unknown>> = {
      'record-1': { id: 'record-1', position: 1 },
    };

    setMockRecordData(mockRecordData);
    const allRecordIds = ['record-1', 'record-2', 'non-existent'];

    const result = extractRecordPositions(allRecordIds, jotaiStore);

    expect(result).toEqual([
      { id: 'record-1', position: 1 },
      { id: 'record-2', position: 0 },
      { id: 'non-existent', position: 0 },
    ]);
  });

  it('should handle empty record list', () => {
    const allRecordIds: string[] = [];

    const result = extractRecordPositions(allRecordIds, jotaiStore);

    expect(result).toEqual([]);
  });

  it('should preserve order of input record IDs', () => {
    const mockRecordData: Record<string, Record<string, unknown>> = {
      'record-1': { id: 'record-1', position: 100 },
      'record-2': { id: 'record-2', position: 50 },
      'record-3': { id: 'record-3', position: 75 },
    };

    setMockRecordData(mockRecordData);
    const allRecordIds = ['record-3', 'record-1', 'record-2'];

    const result = extractRecordPositions(allRecordIds, jotaiStore);

    expect(result).toEqual([
      { id: 'record-3', position: 75 },
      { id: 'record-1', position: 100 },
      { id: 'record-2', position: 50 },
    ]);
  });

  it('should handle null positions', () => {
    const mockRecordData: Record<string, Record<string, unknown>> = {
      'record-1': { id: 'record-1', position: null },
      'record-2': { id: 'record-2', position: 2 },
    };

    setMockRecordData(mockRecordData);
    const allRecordIds = ['record-1', 'record-2'];

    const result = extractRecordPositions(allRecordIds, jotaiStore);

    expect(result).toEqual([
      { id: 'record-1', position: 0 },
      { id: 'record-2', position: 2 },
    ]);
  });

  it('should handle negative positions', () => {
    const mockRecordData: Record<string, Record<string, unknown>> = {
      'record-1': { id: 'record-1', position: -5 },
      'record-2': { id: 'record-2', position: -10 },
    };

    setMockRecordData(mockRecordData);
    const allRecordIds = ['record-1', 'record-2'];

    const result = extractRecordPositions(allRecordIds, jotaiStore);

    expect(result).toEqual([
      { id: 'record-1', position: -5 },
      { id: 'record-2', position: -10 },
    ]);
  });

  it('should handle decimal positions', () => {
    const mockRecordData: Record<string, Record<string, unknown>> = {
      'record-1': { id: 'record-1', position: 1.5 },
      'record-2': { id: 'record-2', position: 2.75 },
    };

    setMockRecordData(mockRecordData);
    const allRecordIds = ['record-1', 'record-2'];

    const result = extractRecordPositions(allRecordIds, jotaiStore);

    expect(result).toEqual([
      { id: 'record-1', position: 1.5 },
      { id: 'record-2', position: 2.75 },
    ]);
  });
});
