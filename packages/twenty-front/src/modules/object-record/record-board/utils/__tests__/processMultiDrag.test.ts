import { DropResult } from '@hello-pangea/dnd';
import { processMultiDrag } from '../processMultiDrag';

import { calculateRecordPositions } from '../calculateRecordPositions';

jest.mock('../calculateRecordPositions', () => ({
  calculateRecordPositions: jest.fn(),
}));

const mockCalculateRecordPositions = calculateRecordPositions as jest.Mock;

describe('processMultiDrag', () => {
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

  it('should process multi-drag operation correctly', () => {
    const selectedRecordIds = ['record-1', 'record-3'];

    mockCalculateRecordPositions.mockReturnValue({
      'record-1': 2.5,
      'record-3': 2.5001,
    });

    const result = processMultiDrag({
      result: mockDropResult,
      selectedRecordIds,
      recordPositionData: mockRecordPositionData,
      destinationRecordIds: ['record-1', 'record-2', 'record-3'],
      groupValue: 'new-group-value',
      selectFieldName: 'status',
    });

    expect(result).toEqual({
      recordUpdates: [
        {
          recordId: 'record-1',
          position: 2.5,
          groupValue: 'new-group-value',
          selectFieldName: 'status',
        },
        {
          recordId: 'record-3',
          position: 2.5001,
          groupValue: 'new-group-value',
          selectFieldName: 'status',
        },
      ],
    });

    expect(mockCalculateRecordPositions).toHaveBeenCalledWith({
      destinationRecordIds: ['record-1', 'record-2', 'record-3'],
      recordsToMove: selectedRecordIds,
      destinationIndex: 1,
      recordPositionData: mockRecordPositionData,
    });
  });

  it('should handle single record in multi-drag correctly', () => {
    const selectedRecordIds = ['record-2'];

    mockCalculateRecordPositions.mockReturnValue({
      'record-2': 3.5,
    });

    const result = processMultiDrag({
      result: mockDropResult,
      selectedRecordIds,
      recordPositionData: mockRecordPositionData,
      destinationRecordIds: ['record-1', 'record-2', 'record-3'],
      groupValue: 'single-record-group',
      selectFieldName: 'priority',
    });

    expect(result).toEqual({
      recordUpdates: [
        {
          recordId: 'record-2',
          position: 3.5,
          groupValue: 'single-record-group',
          selectFieldName: 'priority',
        },
      ],
    });
  });

  it('should handle null group value', () => {
    const selectedRecordIds = ['record-1', 'record-2'];

    mockCalculateRecordPositions.mockReturnValue({
      'record-1': 1.5,
      'record-2': 1.5001,
    });

    const result = processMultiDrag({
      result: mockDropResult,
      selectedRecordIds,
      recordPositionData: mockRecordPositionData,
      destinationRecordIds: ['record-1', 'record-2', 'record-3'],
      groupValue: null,
      selectFieldName: 'category',
    });

    expect(result).toEqual({
      recordUpdates: [
        {
          recordId: 'record-1',
          position: 1.5,
          groupValue: null,
          selectFieldName: 'category',
        },
        {
          recordId: 'record-2',
          position: 1.5001,
          groupValue: null,
          selectFieldName: 'category',
        },
      ],
    });
  });

  it('should throw error when destination is null', () => {
    const dropResultWithoutDestination = {
      ...mockDropResult,
      destination: null,
    };

    expect(() => {
      processMultiDrag({
        result: dropResultWithoutDestination,
        selectedRecordIds: ['record-1', 'record-2'],
        recordPositionData: mockRecordPositionData,
        destinationRecordIds: ['record-1', 'record-2', 'record-3'],
        groupValue: 'new-group-value',
        selectFieldName: 'status',
      });
    }).toThrow('Destination is required for drag operation');
  });

  it('should handle empty selectedRecordIds', () => {
    const selectedRecordIds: string[] = [];

    mockCalculateRecordPositions.mockReturnValue({});

    const result = processMultiDrag({
      result: mockDropResult,
      selectedRecordIds,
      recordPositionData: mockRecordPositionData,
      destinationRecordIds: ['record-1', 'record-2', 'record-3'],
      groupValue: 'empty-selection',
      selectFieldName: 'status',
    });

    expect(result).toEqual({
      recordUpdates: [],
    });
  });
});
