import { processMultiTableDrag } from '@/object-record/record-drag/table/utils/processMultiTableDrag';

const createMockDropResult = (
  sourceIndex: number,
  destinationIndex: number,
  draggableId: string,
) => ({
  draggableId,
  type: 'DEFAULT',
  source: { droppableId: 'table', index: sourceIndex },
  destination: { droppableId: 'table', index: destinationIndex },
  reason: 'DROP' as const,
  mode: 'FLUID' as const,
  combine: null,
});

describe('processMultiTableDrag', () => {
  const mockRecordPositionData = [
    { recordId: 'record1', position: 1 },
    { recordId: 'record2', position: 2 },
    { recordId: 'record3', position: 3 },
    { recordId: 'record4', position: 4 },
    { recordId: 'record5', position: 5 },
  ];

  const allRecordIds = ['record1', 'record2', 'record3', 'record4', 'record5'];

  it('should process multi-drag moving records to middle', () => {
    const result = processMultiTableDrag({
      result: createMockDropResult(0, 2, 'record1'),
      selectedRecordIds: ['record1', 'record2'],
      recordPositionData: mockRecordPositionData,
      allRecordIds,
    });

    expect(result.recordUpdates).toHaveLength(2);
    expect(result.recordUpdates[0].recordId).toBe('record1');
    expect(result.recordUpdates[1].recordId).toBe('record2');

    expect(typeof result.recordUpdates[0].position).toBe('number');
    expect(typeof result.recordUpdates[1].position).toBe('number');

    expect(result.recordUpdates[0].position).toBeLessThan(
      result.recordUpdates[1].position,
    );
  });

  it('should throw error when no destination', () => {
    const resultWithoutDestination = {
      ...createMockDropResult(0, 2, 'record1'),
      destination: null,
    };

    expect(() => {
      processMultiTableDrag({
        result: resultWithoutDestination,
        selectedRecordIds: ['record1'],
        recordPositionData: mockRecordPositionData,
        allRecordIds,
      });
    }).toThrow('Destination is required for drag operation');
  });

  it('should handle single record in multi-drag context', () => {
    const result = processMultiTableDrag({
      result: createMockDropResult(1, 3, 'record2'),
      selectedRecordIds: ['record2'],
      recordPositionData: mockRecordPositionData,
      allRecordIds,
    });

    expect(result.recordUpdates).toHaveLength(1);
    expect(result.recordUpdates[0].recordId).toBe('record2');
    expect(typeof result.recordUpdates[0].position).toBe('number');
  });

  it('should handle all records being moved', () => {
    const result = processMultiTableDrag({
      result: createMockDropResult(0, 0, 'record1'),
      selectedRecordIds: allRecordIds,
      recordPositionData: mockRecordPositionData,
      allRecordIds,
    });

    expect(result.recordUpdates).toHaveLength(5);

    result.recordUpdates.forEach((update) => {
      expect(typeof update.position).toBe('number');
    });
  });
});
