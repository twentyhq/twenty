import { type ObjectRecord } from 'twenty-shared/types';

import { compareRecordsByOrderBy } from '@/object-record/utils/compareRecordsByOrderBy';

const recordWithPosition = (position: unknown): ObjectRecord => ({
  id: `id-${String(position)}`,
  position,
});

describe('compareRecordsByOrderBy', () => {
  it('orders numbers by the first orderBy direction', () => {
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

  it('orders strings case-insensitively', () => {
    expect(
      compareRecordsByOrderBy({
        recordA: { id: 'a', name: 'alpha' },
        recordB: { id: 'b', name: 'Beta' },
        orderBy: [{ name: 'AscNullsLast' }],
      }),
    ).toBe(-1);
  });

  it('walks composite sub fields', () => {
    expect(
      compareRecordsByOrderBy({
        recordA: { id: 'a', name: { firstName: 'Zoe' } },
        recordB: { id: 'b', name: { firstName: 'Adam' } },
        orderBy: [{ name: { firstName: 'AscNullsFirst' } }],
      }),
    ).toBe(1);
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

  it('treats a null relation as a null sort value', () => {
    expect(
      compareRecordsByOrderBy({
        recordA: { id: 'a', company: null },
        recordB: { id: 'b', company: { name: 'Acme' } },
        orderBy: [{ company: { name: 'AscNullsLast' } }],
      }),
    ).toBe(1);
  });

  it('returns 0 on a tie so the caller treats it as undecided', () => {
    expect(
      compareRecordsByOrderBy({
        recordA: recordWithPosition(3),
        recordB: recordWithPosition(3),
        orderBy: [{ position: 'AscNullsFirst' }],
      }),
    ).toBe(0);
  });

  it('returns null when the sort field is missing from a record', () => {
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

    expect(
      compareRecordsByOrderBy({
        recordA: { id: 'a', company: {} },
        recordB: { id: 'b', company: { name: 'Acme' } },
        orderBy: [{ company: { name: 'DescNullsLast' } }],
      }),
    ).toBeNull();
  });

  it('returns null when a value is not a scalar or types differ', () => {
    expect(
      compareRecordsByOrderBy({
        recordA: recordWithPosition('first'),
        recordB: recordWithPosition(3),
        orderBy: [{ position: 'AscNullsFirst' }],
      }),
    ).toBeNull();

    expect(
      compareRecordsByOrderBy({
        recordA: recordWithPosition({ nested: true }),
        recordB: recordWithPosition(3),
        orderBy: [{ position: 'AscNullsFirst' }],
      }),
    ).toBeNull();
  });

  it('returns null without an orderBy', () => {
    expect(
      compareRecordsByOrderBy({
        recordA: recordWithPosition(1),
        recordB: recordWithPosition(2),
        orderBy: [],
      }),
    ).toBeNull();
  });
});
