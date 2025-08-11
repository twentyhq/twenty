import { type RecordDragPositionData } from '@/object-record/record-drag/shared/types/RecordDragPositionData';
import { processMultiDrag } from '@/object-record/record-drag/shared/utils/processMultiDrag';
import { type DropResult } from '@hello-pangea/dnd';

jest.mock(
  '@/object-record/record-drag/shared/utils/calculateDragPositions',
  () => ({
    calculateDragPositions: jest.fn(({ recordsToMove }) => {
      const positions: Record<string, number> = {};
      recordsToMove.forEach((id: string, index: number) => {
        positions[id] = 1500 + index * 500;
      });
      return positions;
    }),
  }),
);

describe('processMultiDrag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRecordPositionData: RecordDragPositionData[] = [
    { recordId: 'record-1', position: 1000 },
    { recordId: 'record-2', position: 2000 },
    { recordId: 'record-3', position: 3000 },
    { recordId: 'record-4', position: 4000 },
  ];

  const createDropResult = (
    draggableId: string,
    destinationIndex: number | null,
  ): DropResult => ({
    draggableId,
    type: 'record',
    source: {
      droppableId: 'source',
      index: 0,
    },
    destination:
      destinationIndex !== null
        ? {
            droppableId: 'destination',
            index: destinationIndex,
          }
        : null,
    reason: 'DROP',
    mode: 'FLUID',
    combine: null,
  });

  describe('Table context (without group fields)', () => {
    it('should process multi drag for table', () => {
      const result = createDropResult('record-2', 3);
      const selectedRecordIds = ['record-1', 'record-2', 'record-3'];

      const dragResult = processMultiDrag({
        result,
        selectedRecordIds,
        recordPositionData: mockRecordPositionData,
        recordIds: ['record-1', 'record-2', 'record-3', 'record-4'],
      });

      expect(dragResult.recordUpdates).toEqual([
        { recordId: 'record-1', position: 1500 },
        { recordId: 'record-2', position: 2000 },
        { recordId: 'record-3', position: 2500 },
      ]);

      dragResult.recordUpdates.forEach((update) => {
        expect(update).not.toHaveProperty('groupValue');
        expect(update).not.toHaveProperty('selectFieldName');
      });
    });

    it('should throw error when destination is null', () => {
      const result = createDropResult('record-1', null);
      const selectedRecordIds = ['record-1', 'record-2'];

      expect(() => {
        processMultiDrag({
          result,
          selectedRecordIds,
          recordPositionData: mockRecordPositionData,
          recordIds: ['record-1', 'record-2', 'record-3'],
        });
      }).toThrow('Destination is required for drag operation');
    });
  });

  describe('Board context (with group fields)', () => {
    it('should process multi drag for board with group fields', () => {
      const result = createDropResult('record-2', 3);
      const selectedRecordIds = ['record-1', 'record-2', 'record-3'];

      const dragResult = processMultiDrag({
        result,
        selectedRecordIds,
        recordPositionData: mockRecordPositionData,
        recordIds: ['record-1', 'record-2', 'record-3', 'record-4'],
        groupValue: 'in-progress',
        selectFieldName: 'status',
      });

      expect(dragResult.recordUpdates).toEqual([
        {
          recordId: 'record-1',
          position: 1500,
          groupValue: 'in-progress',
          selectFieldName: 'status',
        },
        {
          recordId: 'record-2',
          position: 2000,
          groupValue: 'in-progress',
          selectFieldName: 'status',
        },
        {
          recordId: 'record-3',
          position: 2500,
          groupValue: 'in-progress',
          selectFieldName: 'status',
        },
      ]);
    });

    it('should handle null group value', () => {
      const result = createDropResult('record-1', 1);
      const selectedRecordIds = ['record-1', 'record-2'];

      const dragResult = processMultiDrag({
        result,
        selectedRecordIds,
        recordPositionData: mockRecordPositionData,
        recordIds: ['record-1', 'record-2', 'record-3'],
        groupValue: null,
        selectFieldName: 'status',
      });

      expect(dragResult.recordUpdates).toEqual([
        {
          recordId: 'record-1',
          position: 1500,
          groupValue: null,
          selectFieldName: 'status',
        },
        {
          recordId: 'record-2',
          position: 2000,
          groupValue: null,
          selectFieldName: 'status',
        },
      ]);
    });
  });

  describe('Edge cases', () => {
    it('should handle single record in selection', () => {
      const result = createDropResult('record-1', 2);
      const selectedRecordIds = ['record-1'];

      const dragResult = processMultiDrag({
        result,
        selectedRecordIds,
        recordPositionData: mockRecordPositionData,
        recordIds: ['record-1', 'record-2', 'record-3'],
      });

      expect(dragResult.recordUpdates).toEqual([
        { recordId: 'record-1', position: 1500 },
      ]);
    });

    it('should handle empty selection', () => {
      const result = createDropResult('record-1', 2);
      const selectedRecordIds: string[] = [];

      const dragResult = processMultiDrag({
        result,
        selectedRecordIds,
        recordPositionData: mockRecordPositionData,
        recordIds: ['record-1', 'record-2', 'record-3'],
      });

      expect(dragResult.recordUpdates).toEqual([]);
    });

    it('should not include group fields when only one is provided', () => {
      const result = createDropResult('record-1', 2);
      const selectedRecordIds = ['record-1', 'record-2'];

      const dragResult = processMultiDrag({
        result,
        selectedRecordIds,
        recordPositionData: mockRecordPositionData,
        recordIds: ['record-1', 'record-2', 'record-3'],
        groupValue: 'group-1',
      });

      expect(dragResult.recordUpdates).toEqual([
        { recordId: 'record-1', position: 1500 },
        { recordId: 'record-2', position: 2000 },
      ]);

      dragResult.recordUpdates.forEach((update) => {
        expect(update).not.toHaveProperty('groupValue');
        expect(update).not.toHaveProperty('selectFieldName');
      });
    });
  });
});
