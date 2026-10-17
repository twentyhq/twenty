import { compareRecordsByOrderBy } from '@/object-record/utils/compareRecordsByOrderBy';

const recordWithPosition = (position: unknown) =>
  ({ id: `id-${String(position)}`, position }) as unknown as Parameters<
    typeof compareRecordsByOrderBy
  >[0]['recordA'];

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
    const recordA = { id: 'a', name: 'alpha' } as never;
    const recordB = { id: 'b', name: 'Beta' } as never;

    expect(
      compareRecordsByOrderBy({
        recordA,
        recordB,
        orderBy: [{ name: 'AscNullsLast' }],
      }),
    ).toBe(-1);
  });

  it('walks composite sub fields', () => {
    const recordA = { id: 'a', name: { firstName: 'Zoe' } } as never;
    const recordB = { id: 'b', name: { firstName: 'Adam' } } as never;

    expect(
      compareRecordsByOrderBy({
        recordA,
        recordB,
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

  it('returns 0 on a tie so the caller treats it as undecided', () => {
    expect(
      compareRecordsByOrderBy({
        recordA: recordWithPosition(3),
        recordB: recordWithPosition(3),
        orderBy: [{ position: 'AscNullsFirst' }],
      }),
    ).toBe(0);
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
