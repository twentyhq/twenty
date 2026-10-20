import { computeRowSlotBindings } from '@/object-record/record-table/virtualization/utils/computeRowSlotBindings';

describe('computeRowSlotBindings', () => {
  it('keeps every record in its slot when a record is inserted before it', () => {
    const currentBindings = computeRowSlotBindings({
      currentBindings: [null, null, null, null],
      recordIdsByRowIndex: ['a', 'b', 'c'],
      firstRowIndex: 0,
      lastRowIndex: 2,
    });

    const nextBindings = computeRowSlotBindings({
      currentBindings,
      recordIdsByRowIndex: ['new', 'a', 'b', 'c'],
      firstRowIndex: 0,
      lastRowIndex: 3,
    });

    expect(nextBindings.slice(0, 3)).toEqual(currentBindings.slice(0, 3));
    expect(nextBindings[0]).toBe(currentBindings[0]);
    expect(nextBindings[3]).toEqual({ type: 'record', recordId: 'new' });
  });

  it('frees the slots of records that left the window and shows skeletons for unloaded rows', () => {
    const currentBindings = computeRowSlotBindings({
      currentBindings: [null, null, null],
      recordIdsByRowIndex: ['a', 'b', 'c'],
      firstRowIndex: 0,
      lastRowIndex: 2,
    });

    const recordIdsByRowIndex: string[] = [];

    recordIdsByRowIndex[1] = 'b';
    recordIdsByRowIndex[2] = 'c';

    const nextBindings = computeRowSlotBindings({
      currentBindings,
      recordIdsByRowIndex,
      firstRowIndex: 1,
      lastRowIndex: 3,
    });

    expect(nextBindings[0]).toEqual({ type: 'skeleton', rowIndex: 3 });
    expect(nextBindings[1]).toBe(currentBindings[1]);
    expect(nextBindings[2]).toBe(currentBindings[2]);
  });
});
