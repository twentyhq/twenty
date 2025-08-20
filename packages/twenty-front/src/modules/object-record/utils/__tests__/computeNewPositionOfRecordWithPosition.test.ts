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
    const newPositionForB = computeNewPositionOfRecordWithPosition({
      arrayOfRecordsWithPosition: mockRecordsWithPosition,
      idOfItemToMove: 'B',
      idOfTargetItem: 'A',
    });

    expect(newPositionForB).toEqual(-1);
  });

  it('should compute last position', () => {
    const newPositionForB = computeNewPositionOfRecordWithPosition({
      arrayOfRecordsWithPosition: mockRecordsWithPosition,
      idOfItemToMove: 'B',
      idOfTargetItem: 'D',
    });

    expect(newPositionForB).toEqual(4);
  });

  it('should compute intermediary position after target item', () => {
    const newPositionForB = computeNewPositionOfRecordWithPosition({
      arrayOfRecordsWithPosition: mockRecordsWithPosition,
      idOfItemToMove: 'A',
      idOfTargetItem: 'B',
    });

    expect(newPositionForB).toEqual(1.5);
  });

  it('should compute intermediary position before target item', () => {
    const newPositionForB = computeNewPositionOfRecordWithPosition({
      arrayOfRecordsWithPosition: mockRecordsWithPosition,
      idOfItemToMove: 'A',
      idOfTargetItem: 'C',
    });

    expect(newPositionForB).toEqual(2.5);
  });
});
