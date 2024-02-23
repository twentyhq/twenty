import { OrderBy } from '@/object-metadata/types/OrderBy';

import { sortObjectRecordByDateField } from './sortObjectRecordByDateField';

describe('sortByObjectRecordByCreatedAt', () => {
  const recordOldest = { id: '', createdAt: '2022-01-01T00:00:00.000Z' };
  const recordNewest = { id: '', createdAt: '2022-01-02T00:00:00.000Z' };
  const recordNull1 = { id: '', createdAt: null };
  const recordNull2 = { id: '', createdAt: null };

  it('should sort in ascending order with null values first', () => {
    const sortDirection = 'AscNullsFirst' satisfies OrderBy;
    const sortedArray = [
      recordNull2,
      recordNewest,
      recordNull1,
      recordOldest,
    ].sort(sortObjectRecordByDateField('createdAt', sortDirection));

    expect(sortedArray).toEqual([
      recordNull1,
      recordNull2,
      recordOldest,
      recordNewest,
    ]);
  });

  it('should sort in descending order with null values first', () => {
    const sortDirection = 'DescNullsFirst' satisfies OrderBy;
    const sortedArray = [
      recordNull2,
      recordOldest,
      recordNewest,
      recordNull1,
    ].sort(sortObjectRecordByDateField('createdAt', sortDirection));

    expect(sortedArray).toEqual([
      recordNull2,
      recordNull1,
      recordNewest,
      recordOldest,
    ]);
  });
  it('should sort in ascending order with null values last', () => {
    const sortDirection = 'AscNullsLast' satisfies OrderBy;
    const sortedArray = [
      recordOldest,
      recordNull2,
      recordNewest,
      recordNull1,
    ].sort(sortObjectRecordByDateField('createdAt', sortDirection));

    expect(sortedArray).toEqual([
      recordOldest,
      recordNewest,
      recordNull1,
      recordNull2,
    ]);
  });

  it('should sort in descending order with null values last', () => {
    const sortDirection = 'DescNullsLast' satisfies OrderBy;
    const sortedArray = [
      recordNull1,
      recordOldest,
      recordNewest,
      recordNull2,
    ].sort(sortObjectRecordByDateField('createdAt', sortDirection));

    expect(sortedArray).toEqual([
      recordNewest,
      recordOldest,
      recordNull1,
      recordNull2,
    ]);
  });
});
