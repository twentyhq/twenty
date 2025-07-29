import { DropResult } from '@hello-pangea/dnd';
import { processSingleDrag } from '../processSingleDrag';

import { calculateRecordPositions } from '../calculateRecordPositions';

jest.mock('../calculateRecordPositions', () => ({
  calculateRecordPositions: jest.fn(),
}));

const mockCalculateRecordPositions = calculateRecordPositions as jest.Mock;

describe('processSingleDrag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockDropResult: DropResult = {
    draggableId: 'record-1',
    type: 'DEFAULT',
    source: {
      droppableId: 'group-1',
      index: 0,
    },
    destination: {
      droppableId: 'group-2',
      index: 1,
    },
    reason: 'DROP',
    mode: 'FLUID',
    combine: null,
  };

  const mockRecordPositionData = [
    { recordId: 'record-1', position: 1 },
    { recordId: 'record-2', position: 2 },
    { recordId: 'record-3', position: 3 },
  ];

  it('should process single drag operation correctly', () => {
    const expectedPosition = 2.5;

    mockCalculateRecordPositions.mockReturnValue({
      'record-1': expectedPosition,
    });

    const result = processSingleDrag({
      result: mockDropResult,
      recordPositionData: mockRecordPositionData,
      destinationRecordIds: ['record-1', 'record-2', 'record-3'],
      groupValue: 'new-group-value',
      selectFieldName: 'status',
    });

    expect(result).toEqual({
      recordId: 'record-1',
      position: expectedPosition,
      groupValue: 'new-group-value',
      selectFieldName: 'status',
    });

    expect(mockCalculateRecordPositions).toHaveBeenCalledWith({
      destinationRecordIds: ['record-1', 'record-2', 'record-3'],
      recordsToMove: ['record-1'],
      destinationIndex: 1,
      recordPositionData: mockRecordPositionData,
    });
  });

  it('should handle different record IDs correctly', () => {
    const dropResult = {
      ...mockDropResult,
      draggableId: 'record-5',
    };

    const expectedPosition = 3.5;

    mockCalculateRecordPositions.mockReturnValue({
      'record-5': expectedPosition,
    });

    const result = processSingleDrag({
      result: dropResult,
      recordPositionData: mockRecordPositionData,
      destinationRecordIds: ['record-1', 'record-2', 'record-3'],
      groupValue: 'another-group-value',
      selectFieldName: 'priority',
    });

    expect(result).toEqual({
      recordId: 'record-5',
      position: expectedPosition,
      groupValue: 'another-group-value',
      selectFieldName: 'priority',
    });

    expect(mockCalculateRecordPositions).toHaveBeenCalledWith({
      destinationRecordIds: ['record-1', 'record-2', 'record-3'],
      recordsToMove: ['record-5'],
      destinationIndex: 1,
      recordPositionData: mockRecordPositionData,
    });
  });

  it('should handle null group value', () => {
    const expectedPosition = 1.5;

    mockCalculateRecordPositions.mockReturnValue({
      'record-1': expectedPosition,
    });

    const result = processSingleDrag({
      result: mockDropResult,
      recordPositionData: mockRecordPositionData,
      destinationRecordIds: ['record-1', 'record-2', 'record-3'],
      groupValue: null,
      selectFieldName: 'category',
    });

    expect(result).toEqual({
      recordId: 'record-1',
      position: expectedPosition,
      groupValue: null,
      selectFieldName: 'category',
    });
  });

  it('should throw error when destination is null', () => {
    const dropResultWithoutDestination = {
      ...mockDropResult,
      destination: null,
    };

    expect(() => {
      processSingleDrag({
        result: dropResultWithoutDestination,
        recordPositionData: mockRecordPositionData,
        destinationRecordIds: ['record-1', 'record-2', 'record-3'],
        groupValue: 'new-group-value',
        selectFieldName: 'status',
      });
    }).toThrow('Destination is required for drag operation');
  });
});
