import { type RecordDragPositionData } from '@/object-record/record-drag/shared/types/RecordDragPositionData';
import { processSingleDrag } from '@/object-record/record-drag/shared/utils/processSingleDrag';
import { type DropResult } from '@hello-pangea/dnd';

jest.mock(
  '@/object-record/record-drag/shared/utils/calculateDragPositions',
  () => ({
    calculateDragPositions: jest.fn(({ recordsToMove }) => {
      const positions: Record<string, number> = {};
      recordsToMove.forEach((id: string, index: number) => {
        positions[id] = 1000 + index * 1000;
      });
      return positions;
    }),
  }),
);

describe('processSingleDrag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRecordPositionData: RecordDragPositionData[] = [
    { recordId: 'record-1', position: 1000 },
    { recordId: 'record-2', position: 2000 },
    { recordId: 'record-3', position: 3000 },
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
    it('should process single drag for table', () => {
      const result = createDropResult('record-1', 2);

      const dragResult = processSingleDrag({
        result,
        recordPositionData: mockRecordPositionData,
        recordIds: ['record-1', 'record-2', 'record-3'],
      });

      expect(dragResult).toEqual({
        recordId: 'record-1',
        position: 1000,
      });
      expect(dragResult).not.toHaveProperty('groupValue');
      expect(dragResult).not.toHaveProperty('selectFieldName');
    });

    it('should throw error when destination is null', () => {
      const result = createDropResult('record-1', null);

      expect(() => {
        processSingleDrag({
          result,
          recordPositionData: mockRecordPositionData,
          recordIds: ['record-1', 'record-2', 'record-3'],
        });
      }).toThrow('Destination is required for drag operation');
    });
  });

  describe('Board context (with group fields)', () => {
    it('should process single drag for board with group fields', () => {
      const result = createDropResult('record-1', 2);

      const dragResult = processSingleDrag({
        result,
        recordPositionData: mockRecordPositionData,
        recordIds: ['record-1', 'record-2', 'record-3'],
        groupValue: 'group-1',
        selectFieldName: 'status',
      });

      expect(dragResult).toEqual({
        recordId: 'record-1',
        position: 1000,
        groupValue: 'group-1',
        selectFieldName: 'status',
      });
    });

    it('should handle null group value', () => {
      const result = createDropResult('record-1', 2);

      const dragResult = processSingleDrag({
        result,
        recordPositionData: mockRecordPositionData,
        recordIds: ['record-1', 'record-2', 'record-3'],
        groupValue: null,
        selectFieldName: 'status',
      });

      expect(dragResult).toEqual({
        recordId: 'record-1',
        position: 1000,
        groupValue: null,
        selectFieldName: 'status',
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty record list', () => {
      const result = createDropResult('record-1', 0);

      const dragResult = processSingleDrag({
        result,
        recordPositionData: [],
        recordIds: [],
      });

      expect(dragResult).toEqual({
        recordId: 'record-1',
        position: 1000,
      });
    });

    it('should not include group fields when only one is provided', () => {
      const result = createDropResult('record-1', 2);

      const dragResult = processSingleDrag({
        result,
        recordPositionData: mockRecordPositionData,
        recordIds: ['record-1', 'record-2', 'record-3'],
        groupValue: 'group-1',
      });

      expect(dragResult).toEqual({
        recordId: 'record-1',
        position: 1000,
      });
      expect(dragResult).not.toHaveProperty('groupValue');
      expect(dragResult).not.toHaveProperty('selectFieldName');
    });
  });
});
