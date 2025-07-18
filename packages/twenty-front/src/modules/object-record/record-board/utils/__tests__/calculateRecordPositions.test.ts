import { calculateRecordPositions } from '../calculateRecordPositions';

import { getDraggedRecordPosition } from '@/object-record/record-board/utils/getDraggedRecordPosition';
import { getIndexNeighboursElementsFromArray } from '~/utils/array/getIndexNeighboursElementsFromArray';

jest.mock(
  '@/object-record/record-board/utils/getDraggedRecordPosition',
  () => ({
    getDraggedRecordPosition: jest.fn(),
  }),
);

jest.mock('~/utils/array/getIndexNeighboursElementsFromArray', () => ({
  getIndexNeighboursElementsFromArray: jest.fn(),
}));

const mockGetDraggedRecordPosition = getDraggedRecordPosition as jest.Mock;
const mockGetIndexNeighboursElementsFromArray =
  getIndexNeighboursElementsFromArray as jest.Mock;

describe('calculateRecordPositions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRecordPositionData = [
    { recordId: 'record-1', position: 1 },
    { recordId: 'record-2', position: 2 },
    { recordId: 'record-3', position: 3 },
    { recordId: 'record-4', position: 4 },
    { recordId: 'record-5', position: 5 },
  ];

  it('should calculate single record position correctly', () => {
    const basePosition = 2.5;

    mockGetIndexNeighboursElementsFromArray.mockReturnValue({
      before: 'record-2',
      after: 'record-3',
    });

    mockGetDraggedRecordPosition.mockReturnValue(basePosition);

    const result = calculateRecordPositions({
      destinationRecordIds: [
        'record-1',
        'record-2',
        'record-3',
        'record-4',
        'record-5',
      ],
      recordsToMove: ['record-1'],
      destinationIndex: 2,
      sourceGroupId: 'group-1',
      destinationGroupId: 'group-2',
      recordPositionData: mockRecordPositionData,
    });

    expect(result).toEqual({
      'record-1': basePosition,
    });
    expect(mockGetDraggedRecordPosition).toHaveBeenCalledWith(2, 3);
  });

  it('should calculate multiple record positions with incremental offsets', () => {
    const basePosition = 2.5;

    mockGetIndexNeighboursElementsFromArray.mockReturnValue({
      before: 'record-2',
      after: 'record-5',
    });

    mockGetDraggedRecordPosition.mockReturnValue(basePosition);

    const result = calculateRecordPositions({
      destinationRecordIds: ['record-2', 'record-3', 'record-4', 'record-5'],
      recordsToMove: ['record-1', 'record-6', 'record-7'],
      destinationIndex: 1,
      sourceGroupId: 'group-1',
      destinationGroupId: 'group-2',
      recordPositionData: mockRecordPositionData,
    });

    expect(result).toEqual({
      'record-1': basePosition,
      'record-6': basePosition + 0.0001,
      'record-7': basePosition + 0.0002,
    });
  });

  it('should filter out records being moved from destination column', () => {
    const basePosition = 2.5;

    mockGetIndexNeighboursElementsFromArray.mockReturnValue({
      before: 'record-2',
      after: 'record-5',
    });

    mockGetDraggedRecordPosition.mockReturnValue(basePosition);

    calculateRecordPositions({
      destinationRecordIds: [
        'record-1',
        'record-2',
        'record-3',
        'record-4',
        'record-5',
      ],
      recordsToMove: ['record-1', 'record-3'],
      destinationIndex: 1,
      sourceGroupId: 'group-1',
      destinationGroupId: 'group-2',
      recordPositionData: mockRecordPositionData,
    });

    expect(mockGetIndexNeighboursElementsFromArray).toHaveBeenCalledWith({
      index: 1,
      array: ['record-2', 'record-4', 'record-5'],
    });
  });

  it('should handle same group single drag by filtering source record', () => {
    const basePosition = 2.5;

    mockGetIndexNeighboursElementsFromArray.mockReturnValue({
      before: 'record-2',
      after: 'record-4',
    });

    mockGetDraggedRecordPosition.mockReturnValue(basePosition);

    calculateRecordPositions({
      destinationRecordIds: [
        'record-1',
        'record-2',
        'record-3',
        'record-4',
        'record-5',
      ],
      recordsToMove: ['record-3'],
      destinationIndex: 1,
      sourceGroupId: 'group-1',
      destinationGroupId: 'group-1',
      recordPositionData: mockRecordPositionData,
    });

    expect(mockGetIndexNeighboursElementsFromArray).toHaveBeenCalledWith({
      index: 1,
      array: ['record-1', 'record-2', 'record-4', 'record-5'],
    });
  });

  it('should handle case with no before record', () => {
    const basePosition = 0.5;

    mockGetIndexNeighboursElementsFromArray.mockReturnValue({
      before: null,
      after: 'record-2',
    });

    mockGetDraggedRecordPosition.mockReturnValue(basePosition);

    const result = calculateRecordPositions({
      destinationRecordIds: ['record-1', 'record-2', 'record-3'],
      recordsToMove: ['record-new'],
      destinationIndex: 0,
      sourceGroupId: 'group-1',
      destinationGroupId: 'group-2',
      recordPositionData: mockRecordPositionData,
    });

    expect(mockGetDraggedRecordPosition).toHaveBeenCalledWith(undefined, 2);
    expect(result).toEqual({
      'record-new': basePosition,
    });
  });

  it('should handle case with no after record', () => {
    const basePosition = 5.5;

    mockGetIndexNeighboursElementsFromArray.mockReturnValue({
      before: 'record-5',
      after: null,
    });

    mockGetDraggedRecordPosition.mockReturnValue(basePosition);

    const result = calculateRecordPositions({
      destinationRecordIds: [
        'record-1',
        'record-2',
        'record-3',
        'record-4',
        'record-5',
      ],
      recordsToMove: ['record-new'],
      destinationIndex: 5,
      sourceGroupId: 'group-1',
      destinationGroupId: 'group-2',
      recordPositionData: mockRecordPositionData,
    });

    expect(mockGetDraggedRecordPosition).toHaveBeenCalledWith(5, undefined);
    expect(result).toEqual({
      'record-new': basePosition,
    });
  });

  it('should handle multi-drag with safe increments when after record exists', () => {
    const basePosition = 2.5;
    const afterPosition = 5.0;

    mockGetIndexNeighboursElementsFromArray.mockReturnValue({
      before: 'record-2',
      after: 'record-5',
    });

    mockGetDraggedRecordPosition.mockReturnValue(basePosition);

    const recordPositionDataWithAfter = [
      ...mockRecordPositionData,
      { recordId: 'record-5', position: afterPosition },
    ];

    const result = calculateRecordPositions({
      destinationRecordIds: [
        'record-1',
        'record-2',
        'record-3',
        'record-4',
        'record-5',
      ],
      recordsToMove: ['record-a', 'record-b'],
      destinationIndex: 1,
      sourceGroupId: 'group-1',
      destinationGroupId: 'group-2',
      recordPositionData: recordPositionDataWithAfter,
    });

    expect(result).toEqual({
      'record-a': basePosition,
      'record-b': basePosition + 0.0001,
    });
  });
});
