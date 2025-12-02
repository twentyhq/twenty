import { processSingleDrag } from '@/object-record/record-drag/utils/processSingleDrag';
import { type RecordWithPosition } from '@/object-record/utils/computeNewPositionOfDraggedRecord';

describe('processSingleDrag', () => {
  const mockRecordPositionData: RecordWithPosition[] = [
    { id: 'record-1', position: 1000 },
    { id: 'record-2', position: 2000 },
    { id: 'record-3', position: 3000 },
  ];

  it('should process single drag at end of list', () => {
    const dragResult = processSingleDrag({
      sourceRecordId: 'record-1',
      targetRecordId: 'record-3',
      recordsWithPosition: mockRecordPositionData,
      isDroppedAfterList: true,
    });

    expect(dragResult).toEqual({
      id: 'record-1',
      position: 3001,
    });
  });

  it('should process single drag at beginning', () => {
    const dragResult = processSingleDrag({
      sourceRecordId: 'record-3',
      targetRecordId: 'record-1',
      recordsWithPosition: mockRecordPositionData,
      isDroppedAfterList: false,
    });

    expect(dragResult).toEqual({
      id: 'record-3',
      position: 999,
    });
  });

  it('should process single drag in between from before', () => {
    const dragResult = processSingleDrag({
      sourceRecordId: 'record-1',
      targetRecordId: 'record-2',
      recordsWithPosition: mockRecordPositionData,
      isDroppedAfterList: false,
    });

    expect(dragResult).toEqual({
      id: 'record-1',
      position: 2500,
    });
  });

  it('should process single drag in between from after', () => {
    const dragResult = processSingleDrag({
      sourceRecordId: 'record-3',
      targetRecordId: 'record-2',
      recordsWithPosition: mockRecordPositionData,
      isDroppedAfterList: false,
    });

    expect(dragResult).toEqual({
      id: 'record-3',
      position: 1500,
    });
  });

  it('should process single drag from other list', () => {
    const dragResult = processSingleDrag({
      sourceRecordId: 'record-4',
      targetRecordId: 'record-2',
      recordsWithPosition: mockRecordPositionData,
      isDroppedAfterList: false,
    });

    expect(dragResult).toEqual({
      id: 'record-4',
      position: 1500,
    });
  });

  it('should handle empty record list', () => {
    expect(() =>
      processSingleDrag({
        sourceRecordId: 'record-1',
        targetRecordId: 'record-1',
        recordsWithPosition: [],
        isDroppedAfterList: false,
      }),
    ).toThrowError('Cannot find item to move for id : record-1');
  });
});
