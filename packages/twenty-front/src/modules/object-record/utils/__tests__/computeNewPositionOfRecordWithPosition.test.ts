import {
  computeNewPositionOfDraggedRecord,
  type RecordWithPosition,
} from '@/object-record/utils/computeNewPositionOfDraggedRecord';

const mockRecordsWithPosition: RecordWithPosition[] = [
  {
    id: 'A',
    position: 0,
  },
  {
    id: 'B',
    position: 1,
  },
  {
    id: 'C',
    position: 2,
  },
  {
    id: 'D',
    position: 3,
  },
];

describe('computeNewPositionOfRecordWithPosition', () => {
  describe('dragging inside same list', () => {
    it('should compute first position', () => {
      const newPosition = computeNewPositionOfDraggedRecord({
        arrayOfRecordsWithPosition: mockRecordsWithPosition,
        idOfItemToMove: 'B',
        idOfTargetItem: 'A',
        isDroppedAfterList: false,
      });

      expect(newPosition).toEqual(-1);
    });

    it('should compute last position', () => {
      const newPosition = computeNewPositionOfDraggedRecord({
        arrayOfRecordsWithPosition: mockRecordsWithPosition,
        idOfItemToMove: 'B',
        idOfTargetItem: 'D',
        isDroppedAfterList: true,
      });

      expect(newPosition).toEqual(4);
    });

    it('should compute intermediary position after target item', () => {
      const newPosition = computeNewPositionOfDraggedRecord({
        arrayOfRecordsWithPosition: mockRecordsWithPosition,
        idOfItemToMove: 'A',
        idOfTargetItem: 'B',
        isDroppedAfterList: false,
      });

      expect(newPosition).toEqual(1.5);
    });

    it('should compute intermediary position before target item', () => {
      const newPosition = computeNewPositionOfDraggedRecord({
        arrayOfRecordsWithPosition: mockRecordsWithPosition,
        idOfItemToMove: 'A',
        idOfTargetItem: 'C',
        isDroppedAfterList: false,
      });

      expect(newPosition).toEqual(2.5);
    });
  });

  describe('dragging from another list', () => {
    it('should compute first position', () => {
      const newPosition = computeNewPositionOfDraggedRecord({
        arrayOfRecordsWithPosition: mockRecordsWithPosition,
        idOfItemToMove: 'Unknown',
        idOfTargetItem: 'A',
        isDroppedAfterList: false,
      });

      expect(newPosition).toEqual(-1);
    });

    it('should compute last position', () => {
      const newPosition = computeNewPositionOfDraggedRecord({
        arrayOfRecordsWithPosition: mockRecordsWithPosition,
        idOfItemToMove: 'Unknown',
        idOfTargetItem: 'D',
        isDroppedAfterList: true,
      });

      expect(newPosition).toEqual(4);
    });

    it('should compute position before last item', () => {
      const newPosition = computeNewPositionOfDraggedRecord({
        arrayOfRecordsWithPosition: mockRecordsWithPosition,
        idOfItemToMove: 'Unknown',
        idOfTargetItem: 'D',
        isDroppedAfterList: false,
      });

      expect(newPosition).toEqual(2.5);
    });

    it('should compute intermediary position after target item', () => {
      const newPosition = computeNewPositionOfDraggedRecord({
        arrayOfRecordsWithPosition: mockRecordsWithPosition,
        idOfItemToMove: 'Unknown',
        idOfTargetItem: 'B',
        isDroppedAfterList: false,
      });

      expect(newPosition).toEqual(0.5);
    });

    it('should compute intermediary position before target item', () => {
      const newPosition = computeNewPositionOfDraggedRecord({
        arrayOfRecordsWithPosition: mockRecordsWithPosition,
        idOfItemToMove: 'Unknown',
        idOfTargetItem: 'C',
        isDroppedAfterList: false,
      });

      expect(newPosition).toEqual(1.5);
    });
  });
});
