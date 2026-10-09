import { computeNewPositionsOfDraggedRecords } from '@/object-record/utils/computeNewPositionsOfDraggedRecords';

describe('computeNewPositionsOfDraggedRecords', () => {
  const records = [
    { id: 'a', position: 1 },
    { id: 'b', position: 2 },
    { id: 'c', position: 3 },
    { id: 'd', position: 4 },
  ];

  it('should gather the selection around the dragged record when it is dropped where it was', () => {
    const result = computeNewPositionsOfDraggedRecords({
      arrayOfRecordsWithPosition: records,
      draggedRecordId: 'c',
      targetRecordId: 'c',
      sourceRecordIds: ['a', 'c'],
      isDroppedAfterList: false,
    });

    const positionById = new Map(
      result.map(({ id, position }) => [id, position]),
    );

    expect(positionById.get('a')).toBeGreaterThan(2);
    expect(positionById.get('a')).toBeLessThan(positionById.get('c') ?? 0);
    expect(positionById.get('c')).toBeLessThan(4);
  });

  it('should gather the selection at the end when the dragged record is the last one', () => {
    const result = computeNewPositionsOfDraggedRecords({
      arrayOfRecordsWithPosition: records,
      draggedRecordId: 'd',
      targetRecordId: 'd',
      sourceRecordIds: ['a', 'd'],
      isDroppedAfterList: true,
    });

    const positionById = new Map(
      result.map(({ id, position }) => [id, position]),
    );

    expect(positionById.get('a')).toBeGreaterThan(3);
    expect(positionById.get('d')).toBeGreaterThan(positionById.get('a') ?? 0);
  });

  it('should place the selection after the last record when moving down onto it', () => {
    const result = computeNewPositionsOfDraggedRecords({
      arrayOfRecordsWithPosition: records,
      draggedRecordId: 'a',
      targetRecordId: 'd',
      sourceRecordIds: ['a', 'b'],
      isDroppedAfterList: false,
    });

    const positionById = new Map(
      result.map(({ id, position }) => [id, position]),
    );

    expect(positionById.get('a')).toBeGreaterThan(4);
    expect(positionById.get('b')).toBeGreaterThan(positionById.get('a') ?? 0);
  });
});
