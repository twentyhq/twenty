import { computeNewPositionsOfDraggedRecords } from '@/object-record/utils/computeNewPositionsOfDraggedRecords';

describe('computeNewPositionsOfDraggedRecords', () => {
  const sourceRecordIds = Array.from(
    { length: 9 },
    (_, index) => `source-${index}`,
  );

  it('should spread dragged records between neighbors without floating point artifacts', () => {
    const result = computeNewPositionsOfDraggedRecords({
      arrayOfRecordsWithPosition: [
        { id: 'first', position: 0 },
        { id: 'target', position: 1 },
      ],
      draggedRecordId: 'source-0',
      targetRecordId: 'target',
      sourceRecordIds,
      isDroppedAfterList: false,
    });

    expect(result?.map(({ position }) => position)).toEqual([
      0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
    ]);
    expect(result?.map(({ id }) => id)).toEqual(sourceRecordIds);
  });

  it('should place dragged records before the first record', () => {
    const result = computeNewPositionsOfDraggedRecords({
      arrayOfRecordsWithPosition: [
        { id: 'target', position: 1 },
        { id: 'other', position: 2 },
      ],
      draggedRecordId: 'source-0',
      targetRecordId: 'target',
      sourceRecordIds: ['source-0', 'source-1', 'source-2', 'source-3'],
      isDroppedAfterList: false,
    });

    expect(result?.map(({ position }) => position)).toEqual([
      0.2, 0.4, 0.6, 0.8,
    ]);
  });

  it('should return null when dropping a record on itself', () => {
    expect(
      computeNewPositionsOfDraggedRecords({
        arrayOfRecordsWithPosition: [{ id: 'target', position: 1 }],
        draggedRecordId: 'target',
        targetRecordId: 'target',
        sourceRecordIds: ['target'],
        isDroppedAfterList: false,
      }),
    ).toBeNull();
  });
});
