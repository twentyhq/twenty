import { computeNewPositionOfDraggedRecord } from '@/object-record/utils/computeNewPositionOfDraggedRecord';

describe('computeNewPositionOfDraggedRecord', () => {
  const records = [
    { id: 'a', position: 1 },
    { id: 'b', position: 2 },
    { id: 'c', position: 3 },
    { id: 'd', position: 4 },
  ];

  it('should return same position when dragging to itself', () => {
    const result = computeNewPositionOfDraggedRecord({
      arrayOfRecordsWithPosition: records,
      idOfItemToMove: 'b',
      idOfTargetItem: 'b',
      isDroppedAfterList: false,
    });

    expect(result).toBe(2);
  });

  it('should return target position + 1 when dropped after list', () => {
    const result = computeNewPositionOfDraggedRecord({
      arrayOfRecordsWithPosition: records,
      idOfItemToMove: 'a',
      idOfTargetItem: 'd',
      isDroppedAfterList: true,
    });

    expect(result).toBe(5);
  });

  it('should return target position - 1 when moving to first position', () => {
    const result = computeNewPositionOfDraggedRecord({
      arrayOfRecordsWithPosition: records,
      idOfItemToMove: 'c',
      idOfTargetItem: 'a',
      isDroppedAfterList: false,
    });

    expect(result).toBe(0);
  });

  it('should compute intermediary position when moving after target', () => {
    const result = computeNewPositionOfDraggedRecord({
      arrayOfRecordsWithPosition: records,
      idOfItemToMove: 'a',
      idOfTargetItem: 'b',
      isDroppedAfterList: false,
    });

    expect(result).toBe(2.5);
  });

  it('should compute intermediary position when moving before target', () => {
    const result = computeNewPositionOfDraggedRecord({
      arrayOfRecordsWithPosition: records,
      idOfItemToMove: 'd',
      idOfTargetItem: 'c',
      isDroppedAfterList: false,
    });

    expect(result).toBe(2.5);
  });

  it('should throw when target item is not found', () => {
    expect(() =>
      computeNewPositionOfDraggedRecord({
        arrayOfRecordsWithPosition: records,
        idOfItemToMove: 'a',
        idOfTargetItem: 'unknown',
        isDroppedAfterList: false,
      }),
    ).toThrow('Cannot find item to move for id : unknown');
  });

  it('should handle item not in table moved before target', () => {
    const result = computeNewPositionOfDraggedRecord({
      arrayOfRecordsWithPosition: records,
      idOfItemToMove: 'new-item',
      idOfTargetItem: 'c',
      isDroppedAfterList: false,
    });

    expect(result).toBe(2.5);
  });

  it('should return target + 1 when moving after last item', () => {
    const result = computeNewPositionOfDraggedRecord({
      arrayOfRecordsWithPosition: records,
      idOfItemToMove: 'a',
      idOfTargetItem: 'd',
      isDroppedAfterList: false,
    });

    expect(result).toBe(4 + 1);
  });
});
