import { computeDroppedRecordPositions } from '@/object-record/record-drag/utils/computeDroppedRecordPositions';
import { extractRecordPositions } from '@/object-record/record-drag/utils/extractRecordPositions';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

// Adversarial reproductions: every assertion below pins a value that is wrong
// for a large-scale board, so a fix that changes the math will (rightly) fail here.
const setRecordPositions = (
  positionByRecordId: Record<string, number | null>,
) => {
  for (const [recordId, position] of Object.entries(positionByRecordId)) {
    jotaiStore.set(recordStoreFamilyState.atomFamily(recordId), {
      id: recordId,
      position,
      __typename: 'Record',
    } as unknown as ObjectRecord);
  }
};

const positionOf = (
  positions: { id: string; position: number }[],
  recordId: string,
) => positions.find(({ id }) => id === recordId)?.position;

describe('computeDroppedRecordPositions at scale (adversarial)', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('ATTACK 1: dropping past the end of a partially loaded column collides with the first unloaded record', () => {
    // Column really holds 500 records at positions 1..500, only page 1 (10) is loaded.
    const loadedIds = Array.from({ length: 10 }, (_, index) => `r${index + 1}`);
    setRecordPositions(
      Object.fromEntries(loadedIds.map((id, index) => [id, index + 1])),
    );
    setRecordPositions({ r11: 11, dragged: 999 });

    const result = computeDroppedRecordPositions({
      destinationRecordIds: loadedIds,
      destinationIndex: 10,
      draggedRecordId: 'dragged',
      draggedRecordIds: ['dragged'],
      store: jotaiStore,
    });

    // lastLoaded.position + 1 === position of the (unloaded) 11th record.
    expect(positionOf(result, 'dragged')).toBe(11);
    expect(positionOf(result, 'dragged')).toBe(
      extractRecordPositions(['r11'], jotaiStore)[0].position,
    );
  });

  it('ATTACK 1b: a column that looks empty (all records filtered out) hands out positions 1..n that collide with existing ones', () => {
    setRecordPositions({ hiddenA: 1, hiddenB: 2, x: 500, y: 501 });

    const result = computeDroppedRecordPositions({
      destinationRecordIds: [],
      destinationIndex: 0,
      draggedRecordId: 'x',
      draggedRecordIds: ['x', 'y'],
      store: jotaiStore,
    });

    expect(result).toEqual([
      { id: 'x', position: 1 },
      { id: 'y', position: 2 },
    ]);
  });

  it('ATTACK 1c: dropping at the top of a partially loaded column ignores unloaded records with lower positions in other pages? (top is safe, bottom is not)', () => {
    const loadedIds = Array.from({ length: 10 }, (_, index) => `r${index + 1}`);
    setRecordPositions(
      Object.fromEntries(loadedIds.map((id, index) => [id, index + 1])),
    );
    setRecordPositions({ dragged: 999 });

    const result = computeDroppedRecordPositions({
      destinationRecordIds: loadedIds,
      destinationIndex: 0,
      draggedRecordId: 'dragged',
      draggedRecordIds: ['dragged'],
      store: jotaiStore,
    });

    expect(positionOf(result, 'dragged')).toBe(0);
  });

  it('ATTACK 3: records whose position is null or missing from the store all read as 0, so a drop between them yields 0 (no-op position)', () => {
    setRecordPositions({ a: null, b: null, c: null });
    // "ghost" is referenced by the column but absent from the record store.
    const result = computeDroppedRecordPositions({
      destinationRecordIds: ['a', 'ghost', 'b', 'c'],
      destinationIndex: 2,
      draggedRecordId: 'c',
      draggedRecordIds: ['c'],
      store: jotaiStore,
    });

    expect(extractRecordPositions(['a', 'ghost'], jotaiStore)).toEqual([
      { id: 'a', position: 0 },
      { id: 'ghost', position: 0 },
    ]);
    // c already "is" at 0 -> useUpdateDroppedRecordOnBoard's isSamePosition short-circuits.
    expect(positionOf(result, 'c')).toBe(0);
  });

  it('ATTACK 2 (multi-drag): 100 cards dropped between two neighbours 2^-46 apart get only 63 distinct positions', () => {
    const lower = 1;
    const upper = 1 + 2 ** -46;
    setRecordPositions({ lower, upper });
    const draggedRecordIds = Array.from({ length: 100 }, (_, i) => `d${i}`);
    setRecordPositions(
      Object.fromEntries(draggedRecordIds.map((id, i) => [id, 1000 + i])),
    );

    const result = computeDroppedRecordPositions({
      destinationRecordIds: ['lower', 'upper'],
      destinationIndex: 1,
      draggedRecordId: 'd0',
      draggedRecordIds,
      store: jotaiStore,
    });

    const distinctPositions = new Set(result.map(({ position }) => position));

    expect(result).toHaveLength(100);
    expect(distinctPositions.size).toBe(63);
    expect(result.every(({ position }) => position > lower)).toBe(true);
    expect(result.every(({ position }) => position < upper)).toBe(true);
  });

  it('ATTACK 2 (multi-drag): neighbours with equal positions make every dragged card land on the same position', () => {
    setRecordPositions({ a: 1, b: 1, c: 1, d0: 50, d1: 51, d2: 52 });

    const result = computeDroppedRecordPositions({
      destinationRecordIds: ['a', 'b', 'c'],
      destinationIndex: 1,
      draggedRecordId: 'd0',
      draggedRecordIds: ['d0', 'd1', 'd2'],
      store: jotaiStore,
    });

    expect(result.map(({ position }) => position)).toEqual([1, 1, 1]);
  });
});
