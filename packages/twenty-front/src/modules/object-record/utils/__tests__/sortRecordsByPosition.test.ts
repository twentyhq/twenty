import { sortRecordsByPosition } from '@/object-record/utils/sortRecordsByPosition';

describe('sortRecordsByPosition', () => {
  it('should sort by numeric position', () => {
    const record1 = { id: '1', __typename: 'Record', position: 1 };
    const record2 = { id: '2', __typename: 'Record', position: 2 };

    expect(sortRecordsByPosition(record1, record2)).toBeLessThan(0);
    expect(sortRecordsByPosition(record2, record1)).toBeGreaterThan(0);
  });

  it('should return 0 for equal numeric positions', () => {
    const record1 = { id: '1', __typename: 'Record', position: 5 };
    const record2 = { id: '2', __typename: 'Record', position: 5 };

    expect(sortRecordsByPosition(record1, record2)).toBe(0);
  });

  it('should place "first" before other positions', () => {
    const record1 = { id: '1', __typename: 'Record', position: 'first' };
    const record2 = { id: '2', __typename: 'Record', position: 'last' };

    expect(sortRecordsByPosition(record1 as any, record2 as any)).toBe(-1);
  });

  it('should place "last" after other positions', () => {
    const record1 = { id: '1', __typename: 'Record', position: 'last' };
    const record2 = { id: '2', __typename: 'Record', position: 'first' };

    expect(sortRecordsByPosition(record1 as any, record2 as any)).toBe(1);
  });

  it('should return 0 for unknown position types', () => {
    const record1 = {
      id: '1',
      __typename: 'Record',
      position: undefined as any,
    };
    const record2 = {
      id: '2',
      __typename: 'Record',
      position: undefined as any,
    };

    expect(sortRecordsByPosition(record1, record2)).toBe(0);
  });
});
