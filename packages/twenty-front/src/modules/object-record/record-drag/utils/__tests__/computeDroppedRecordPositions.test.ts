import { computeDroppedRecordPositions } from '@/object-record/record-drag/utils/computeDroppedRecordPositions';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const setRecordPositions = (positionByRecordId: Record<string, number>) => {
  for (const [recordId, position] of Object.entries(positionByRecordId)) {
    jotaiStore.set(recordStoreFamilyState.atomFamily(recordId), {
      id: recordId,
      position,
      __typename: 'Record',
    } as ObjectRecord);
  }
};

const getPosition = (
  positions: { id: string; position: number }[],
  recordId: string,
) => positions.find(({ id }) => id === recordId)?.position;

describe('computeDroppedRecordPositions', () => {
  beforeEach(() => {
    resetJotaiStore();
    setRecordPositions({ a: 1, b: 2, c: 3, x: 10, y: 11 });
  });

  it('should place records in order in an empty destination', () => {
    expect(
      computeDroppedRecordPositions({
        destinationRecordIds: [],
        destinationIndex: 0,
        draggedRecordId: 'x',
        draggedRecordIds: ['x', 'y'],
        store: jotaiStore,
      }),
    ).toEqual([
      { id: 'x', position: 1 },
      { id: 'y', position: 2 },
    ]);
  });

  it('should place a record from another group before the record at the drop index', () => {
    const positions = computeDroppedRecordPositions({
      destinationRecordIds: ['a', 'b', 'c'],
      destinationIndex: 1,
      draggedRecordId: 'x',
      draggedRecordIds: ['x'],
      store: jotaiStore,
    });

    const position = getPosition(positions, 'x');

    expect(position).toBeGreaterThan(1);
    expect(position).toBeLessThan(2);
  });

  it('should place a record dropped past the end after the last record', () => {
    const positions = computeDroppedRecordPositions({
      destinationRecordIds: ['a', 'b', 'c'],
      destinationIndex: 3,
      draggedRecordId: 'x',
      draggedRecordIds: ['x'],
      store: jotaiStore,
    });

    expect(getPosition(positions, 'x')).toBeGreaterThan(3);
  });

  it('should place a record moved down within its group after the target record', () => {
    const positions = computeDroppedRecordPositions({
      destinationRecordIds: ['a', 'b', 'c'],
      destinationIndex: 1,
      draggedRecordId: 'a',
      draggedRecordIds: ['a'],
      store: jotaiStore,
    });

    const position = getPosition(positions, 'a');

    expect(position).toBeGreaterThan(2);
    expect(position).toBeLessThan(3);
  });

  it('should keep dragged records together and in order in another group', () => {
    const positions = computeDroppedRecordPositions({
      destinationRecordIds: ['a', 'b', 'c'],
      destinationIndex: 1,
      draggedRecordId: 'x',
      draggedRecordIds: ['x', 'y'],
      store: jotaiStore,
    });

    const xPosition = getPosition(positions, 'x') ?? 0;
    const yPosition = getPosition(positions, 'y') ?? 0;

    expect(xPosition).toBeGreaterThan(1);
    expect(yPosition).toBeGreaterThan(xPosition);
    expect(yPosition).toBeLessThan(2);
  });

  it('should keep dragged records together after the last record when dropped past the end', () => {
    const positions = computeDroppedRecordPositions({
      destinationRecordIds: ['a', 'b', 'c'],
      destinationIndex: 3,
      draggedRecordId: 'x',
      draggedRecordIds: ['x', 'y'],
      store: jotaiStore,
    });

    const xPosition = getPosition(positions, 'x') ?? 0;
    const yPosition = getPosition(positions, 'y') ?? 0;

    expect(xPosition).toBeGreaterThan(3);
    expect(yPosition).toBeGreaterThan(xPosition);
  });
});
