import { type ObjectRecord } from 'twenty-shared/types';

import { compareRecordsByOrderBy } from '@/object-record/utils/compareRecordsByOrderBy';

const recordWithPosition = (position: unknown): ObjectRecord => ({
  id: `id-${String(position)}`,
  position,
});

describe('compareRecordsByOrderBy', () => {
  it('orders by the first orderBy direction', () => {
    expect(
      compareRecordsByOrderBy({
        recordA: recordWithPosition(5),
        recordB: recordWithPosition(2),
        orderBy: [{ position: 'AscNullsFirst' }],
      }),
    ).toBe(1);

    expect(
      compareRecordsByOrderBy({
        recordA: recordWithPosition(5),
        recordB: recordWithPosition(2),
        orderBy: [{ position: 'DescNullsLast' }],
      }),
    ).toBe(-1);
  });

  it('places nulls according to the direction', () => {
    expect(
      compareRecordsByOrderBy({
        recordA: recordWithPosition(null),
        recordB: recordWithPosition(3),
        orderBy: [{ position: 'AscNullsFirst' }],
      }),
    ).toBe(-1);

    expect(
      compareRecordsByOrderBy({
        recordA: recordWithPosition(null),
        recordB: recordWithPosition(3),
        orderBy: [{ position: 'AscNullsLast' }],
      }),
    ).toBe(1);
  });

  it('returns null when a sort field is missing instead of treating it as null', () => {
    expect(
      compareRecordsByOrderBy({
        recordA: { id: 'a' },
        recordB: recordWithPosition(3),
        orderBy: [{ position: 'AscNullsLast' }],
      }),
    ).toBeNull();

    expect(
      compareRecordsByOrderBy({
        recordA: { id: 'a' },
        recordB: { id: 'b', company: { name: 'Acme' } },
        orderBy: [{ company: { name: 'DescNullsLast' } }],
      }),
    ).toBeNull();
  });

  it('returns null when the values cannot be compared', () => {
    expect(
      compareRecordsByOrderBy({
        recordA: recordWithPosition('first'),
        recordB: recordWithPosition(3),
        orderBy: [{ position: 'AscNullsFirst' }],
      }),
    ).toBeNull();

    expect(
      compareRecordsByOrderBy({
        recordA: recordWithPosition(1),
        recordB: recordWithPosition(2),
        orderBy: [],
      }),
    ).toBeNull();
  });
});
