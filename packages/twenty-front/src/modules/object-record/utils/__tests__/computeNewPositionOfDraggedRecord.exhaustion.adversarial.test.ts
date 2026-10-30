import { computeNewPositionOfDraggedRecord } from '@/object-record/utils/computeNewPositionOfDraggedRecord';

// Repeatedly dropping a card from another column directly above the same
// neighbour halves the gap each time; double precision runs out of mantissa.
const countDropsUntilCollision = (lower: number, upper: number) => {
  let currentUpper = upper;
  let drops = 0;

  while (drops < 10_000) {
    const position = computeNewPositionOfDraggedRecord({
      arrayOfRecordsWithPosition: [
        { id: 'lower', position: lower },
        { id: 'upper', position: currentUpper },
      ],
      idOfItemToMove: 'incoming',
      idOfTargetItem: 'upper',
      isDroppedAfterList: false,
    });

    drops++;

    if (position === lower || position === currentUpper) {
      return { drops, position, currentUpper };
    }

    currentUpper = position;
  }

  throw new Error('no collision');
};

describe('computeNewPositionOfDraggedRecord floating-point exhaustion (adversarial)', () => {
  it('collides with a neighbour after 53 drops between positions 1 and 2', () => {
    const { drops, position, currentUpper } = countDropsUntilCollision(1, 2);

    expect(drops).toBe(53);
    expect(position).toBe(1);
    expect(currentUpper).toBe(1 + 2 ** -52);
  });

  it('collides after only 37 drops at the magnitude a 100k-row import backfills (~-100000)', () => {
    expect(countDropsUntilCollision(-100001, -100000).drops).toBe(37);
  });

  it('collides after only 34 drops around 1e6', () => {
    expect(countDropsUntilCollision(1e6, 1e6 + 1).drops).toBe(34);
  });

  it('once two neighbours share a position every further drop between them returns that same position', () => {
    const records = [
      { id: 'a', position: 1 },
      { id: 'b', position: 1 },
      { id: 'c', position: 2 },
    ];

    expect(
      computeNewPositionOfDraggedRecord({
        arrayOfRecordsWithPosition: records,
        idOfItemToMove: 'incoming',
        idOfTargetItem: 'b',
        isDroppedAfterList: false,
      }),
    ).toBe(1);

    expect(
      computeNewPositionOfDraggedRecord({
        arrayOfRecordsWithPosition: records,
        idOfItemToMove: 'c',
        idOfTargetItem: 'b',
        isDroppedAfterList: false,
      }),
    ).toBe(1);
  });

  it('a column of null positions (coerced to 0) yields 0 for every in-column move except to the very top (-1)', () => {
    const zeros = [
      { id: 'a', position: 0 },
      { id: 'b', position: 0 },
      { id: 'c', position: 0 },
    ];

    expect(
      computeNewPositionOfDraggedRecord({
        arrayOfRecordsWithPosition: zeros,
        idOfItemToMove: 'a',
        idOfTargetItem: 'b',
        isDroppedAfterList: false,
      }),
    ).toBe(0);
    expect(
      computeNewPositionOfDraggedRecord({
        arrayOfRecordsWithPosition: zeros,
        idOfItemToMove: 'c',
        idOfTargetItem: 'a',
        isDroppedAfterList: false,
      }),
    ).toBe(-1);
  });
});
