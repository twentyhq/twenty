import {
  computeNewPositionOfRecordWithPosition,
  type RecordWithPosition,
} from '@/object-record/utils/computeNewPositionOfRecordWithPosition';

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
  it('should compute first position', () => {
    const newPosition = computeNewPositionOfRecordWithPosition({
      arrayOfRecordsWithPosition: mockRecordsWithPosition,
      idOfItemToMove: 'B',
      idOfTargetItem: 'A',
    });

    expect(newPosition).toEqual(-1);
  });

  it('should compute last position', () => {
    const newPosition = computeNewPositionOfRecordWithPosition({
      arrayOfRecordsWithPosition: mockRecordsWithPosition,
      idOfItemToMove: 'B',
      idOfTargetItem: 'D',
    });

    expect(newPosition).toEqual(4);
  });

  it('should compute intermediary position after target item', () => {
    const newPosition = computeNewPositionOfRecordWithPosition({
      arrayOfRecordsWithPosition: mockRecordsWithPosition,
      idOfItemToMove: 'A',
      idOfTargetItem: 'B',
    });

    expect(newPosition).toEqual(1.5);
  });

  it('should compute intermediary position before target item', () => {
    const newPosition = computeNewPositionOfRecordWithPosition({
      arrayOfRecordsWithPosition: mockRecordsWithPosition,
      idOfItemToMove: 'A',
      idOfTargetItem: 'C',
    });

    expect(newPosition).toEqual(2.5);
  });
});
