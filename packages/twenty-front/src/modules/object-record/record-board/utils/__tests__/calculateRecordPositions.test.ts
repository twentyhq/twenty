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
      recordPositionData: mockRecordPositionData,
    });

    expect(result).toEqual({
      'record-1': basePosition,
    });
    expect(mockGetDraggedRecordPosition).toHaveBeenCalledWith(2, 3);
  });

  it('should calculate multiple record positions with proportional spacing', () => {
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
      recordPositionData: mockRecordPositionData,
    });

    expect(result).toEqual({
      'record-1': 3.125,
      'record-6': 3.75,
      'record-7': 4.375,
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
      recordPositionData: mockRecordPositionData,
    });

    expect(mockGetIndexNeighboursElementsFromArray).toHaveBeenCalledWith({
      index: 1,
      array: ['record-2', 'record-3', 'record-4', 'record-5'],
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
      recordPositionData: mockRecordPositionData,
    });

    expect(mockGetDraggedRecordPosition).toHaveBeenCalledWith(5, undefined);
    expect(result).toEqual({
      'record-new': basePosition,
    });
  });

  it('should handle multi-drag with proportional spacing when after record exists', () => {
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
      recordPositionData: recordPositionDataWithAfter,
    });

    expect(result).toEqual({
      'record-a': 3.3333333333333335,
      'record-b': 4.166666666666667,
    });
  });

  it('should handle multi-drag with default spacing when no after record exists', () => {
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
      recordsToMove: ['record-a', 'record-b'],
      destinationIndex: 5,
      recordPositionData: mockRecordPositionData,
    });

    expect(result).toEqual({
      'record-a': 5.833333333333333,
      'record-b': 6.166666666666667,
    });
  });

  describe('Single drag scenarios', () => {
    it('should handle single drag within same column', () => {
      mockGetIndexNeighboursElementsFromArray.mockReturnValue({
        before: 'record-2',
        after: 'record-4',
      });
      mockGetDraggedRecordPosition.mockReturnValue(2.5);

      const result = calculateRecordPositions({
        destinationRecordIds: ['record-1', 'record-2', 'record-3', 'record-4'],
        recordsToMove: ['record-3'],
        destinationIndex: 2,
        recordPositionData: mockRecordPositionData,
      });

      expect(mockGetIndexNeighboursElementsFromArray).toHaveBeenCalledWith({
        index: 2,
        array: ['record-1', 'record-2', 'record-4'],
      });

      expect(result).toEqual({
        'record-3': 2.5,
      });
    });

    it('should handle single drag to empty column', () => {
      mockGetIndexNeighboursElementsFromArray.mockReturnValue({
        before: undefined,
        after: undefined,
      });
      mockGetDraggedRecordPosition.mockReturnValue(1);

      const result = calculateRecordPositions({
        destinationRecordIds: [],
        recordsToMove: ['record-1'],
        destinationIndex: 0,
        recordPositionData: mockRecordPositionData,
      });

      expect(mockGetIndexNeighboursElementsFromArray).toHaveBeenCalledWith({
        index: 0,
        array: [],
      });

      expect(result).toEqual({
        'record-1': 1,
      });
    });
  });

  describe('Multi-drag scenarios', () => {
    it('should handle multi-drag with secondary records already in destination', () => {
      mockGetIndexNeighboursElementsFromArray.mockReturnValue({
        before: 'record-1',
        after: 'record-4',
      });
      mockGetDraggedRecordPosition.mockReturnValue(2);

      const result = calculateRecordPositions({
        destinationRecordIds: ['record-1', 'record-2', 'record-3', 'record-4'],
        recordsToMove: ['record-2', 'record-3', 'record-5'],
        destinationIndex: 1,
        recordPositionData: mockRecordPositionData,
      });

      expect(mockGetIndexNeighboursElementsFromArray).toHaveBeenCalledWith({
        index: 1,
        array: ['record-1', 'record-3', 'record-4'],
      });

      const availableSpace = 4 - 2;
      const increment = availableSpace / (3 + 1);

      expect(result).toEqual({
        'record-2': 2 + 1 * increment,
        'record-3': 2 + 2 * increment,
        'record-5': 2 + 3 * increment,
      });
    });

    it('should handle multi-drag where all records are from different columns', () => {
      mockGetIndexNeighboursElementsFromArray.mockReturnValue({
        before: 'record-1',
        after: 'record-2',
      });
      mockGetDraggedRecordPosition.mockReturnValue(1.5);

      const result = calculateRecordPositions({
        destinationRecordIds: ['record-1', 'record-2'],
        recordsToMove: ['record-3', 'record-4'],
        destinationIndex: 1,
        recordPositionData: mockRecordPositionData,
      });

      expect(mockGetIndexNeighboursElementsFromArray).toHaveBeenCalledWith({
        index: 1,
        array: ['record-1', 'record-2'],
      });

      const availableSpace = 2 - 1.5;
      const increment = availableSpace / 3;

      expect(result).toEqual({
        'record-3': 1.5 + increment,
        'record-4': 1.5 + 2 * increment,
      });
    });

    it('should handle multi-drag to empty column', () => {
      mockGetIndexNeighboursElementsFromArray.mockReturnValue({
        before: undefined,
        after: undefined,
      });
      mockGetDraggedRecordPosition.mockReturnValue(1);

      const result = calculateRecordPositions({
        destinationRecordIds: [],
        recordsToMove: ['record-1', 'record-2'],
        destinationIndex: 0,
        recordPositionData: mockRecordPositionData,
      });

      expect(mockGetIndexNeighboursElementsFromArray).toHaveBeenCalledWith({
        index: 0,
        array: [],
      });

      const increment = 1 / 3;

      expect(result).toEqual({
        'record-1': 1 + increment,
        'record-2': 1 + 2 * increment,
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle moving to beginning of column (index 0)', () => {
      mockGetIndexNeighboursElementsFromArray.mockReturnValue({
        before: undefined,
        after: 'record-1',
      });
      mockGetDraggedRecordPosition.mockReturnValue(0.5);

      const result = calculateRecordPositions({
        destinationRecordIds: ['record-1', 'record-2'],
        recordsToMove: ['record-3'],
        destinationIndex: 0,
        recordPositionData: mockRecordPositionData,
      });

      expect(mockGetIndexNeighboursElementsFromArray).toHaveBeenCalledWith({
        index: 0,
        array: ['record-1', 'record-2'],
      });

      expect(result).toEqual({
        'record-3': 0.5,
      });
    });

    it('should handle moving to end of column', () => {
      mockGetIndexNeighboursElementsFromArray.mockReturnValue({
        before: 'record-2',
        after: undefined,
      });
      mockGetDraggedRecordPosition.mockReturnValue(2.5);

      const result = calculateRecordPositions({
        destinationRecordIds: ['record-1', 'record-2'],
        recordsToMove: ['record-3'],
        destinationIndex: 2,
        recordPositionData: mockRecordPositionData,
      });

      expect(mockGetIndexNeighboursElementsFromArray).toHaveBeenCalledWith({
        index: 2,
        array: ['record-1', 'record-2'],
      });

      expect(result).toEqual({
        'record-3': 2.5,
      });
    });
  });
});
