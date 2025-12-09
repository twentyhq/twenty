import { processMultiDrag } from '@/object-record/record-drag/utils/processMultiDrag';
import { type RecordWithPosition } from '@/object-record/utils/computeNewPositionOfDraggedRecord';

describe('processMultiDrag', () => {
  const recordsWithPosition: RecordWithPosition[] = [
    { id: 'record-1', position: 1000 },
    { id: 'record-2', position: 2000 },
    { id: 'record-3', position: 3000 },
    { id: 'record-4', position: 4000 },
  ];

  it('should process multi drag for table and drop at the end', () => {
    const selectedRecordIds = ['record-1', 'record-2', 'record-3'];

    const dragResult = processMultiDrag({
      draggedRecordId: 'record-2',
      targetRecordId: 'record-4',
      selectedRecordIds,
      recordsWithPosition,
      isDroppedAfterList: true,
    });

    expect(dragResult.recordUpdates).toEqual([
      { id: 'record-1', position: 4001 },
      { id: 'record-2', position: 4002 },
      { id: 'record-3', position: 4003 },
    ]);
  });

  it('should throw error when destination is null', () => {
    const selectedRecordIds = ['record-1', 'record-2'];

    expect(() => {
      processMultiDrag({
        draggedRecordId: 'record-1',
        targetRecordId: '',
        selectedRecordIds,
        recordsWithPosition,
        isDroppedAfterList: false,
      });
    }).toThrow('Cannot find item to move for id : ');
  });

  it('should handle single record in selection', () => {
    const selectedRecordIds = ['record-1'];

    const dragResult = processMultiDrag({
      draggedRecordId: 'record-1',
      targetRecordId: 'record-3',
      selectedRecordIds,
      recordsWithPosition,
      isDroppedAfterList: false,
    });

    expect(dragResult.recordUpdates).toEqual([
      { id: 'record-1', position: 3500 },
    ]);
  });

  it('should handle empty selection', () => {
    const selectedRecordIds: string[] = [];

    const dragResult = processMultiDrag({
      draggedRecordId: 'record-1',
      targetRecordId: 'record-3',
      selectedRecordIds,
      recordsWithPosition,
      isDroppedAfterList: false,
    });

    expect(dragResult.recordUpdates).toEqual([]);
  });
});
