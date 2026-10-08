import { getRecordIdsBetween } from '@/object-record/record-selection/utils/getRecordIdsBetween';

const recordIds = ['a', 'b', 'c', 'd'];

describe('getRecordIdsBetween', () => {
  it('should return the records between two records, both included', () => {
    expect(
      getRecordIdsBetween({
        recordIds,
        firstRecordId: 'b',
        secondRecordId: 'd',
      }),
    ).toEqual(['b', 'c', 'd']);
  });

  it('should not depend on the order of the two records', () => {
    expect(
      getRecordIdsBetween({
        recordIds,
        firstRecordId: 'c',
        secondRecordId: 'a',
      }),
    ).toEqual(['a', 'b', 'c']);
  });

  it('should return nothing when a record is not in the list', () => {
    expect(
      getRecordIdsBetween({
        recordIds,
        firstRecordId: 'a',
        secondRecordId: 'z',
      }),
    ).toEqual([]);
  });
});
