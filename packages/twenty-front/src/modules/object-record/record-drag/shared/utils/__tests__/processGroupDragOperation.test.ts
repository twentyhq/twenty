import { type DropResult } from '@hello-pangea/dnd';
import { type Snapshot } from 'recoil';

import { processGroupDragOperation } from '../processGroupDragOperation';

jest.mock('../getDragOperationType');
jest.mock('../extractRecordPositions');
jest.mock('../processSingleDrag');
jest.mock('../processMultiDrag');
jest.mock('@/ui/utilities/state/utils/getSnapshotValue');

import { getDragOperationType } from '../getDragOperationType';
import { extractRecordPositions } from '../extractRecordPositions';
import { processSingleDrag } from '../processSingleDrag';
import { processMultiDrag } from '../processMultiDrag';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

const mockGetDragOperationType = getDragOperationType as jest.Mock;
const mockExtractRecordPositions = extractRecordPositions as jest.Mock;
const mockProcessSingleDrag = processSingleDrag as jest.Mock;
const mockProcessMultiDrag = processMultiDrag as jest.Mock;
const mockGetSnapshotValue = getSnapshotValue as jest.Mock;

describe('processGroupDragOperation', () => {
  const mockSnapshot = {} as Snapshot;
  const mockOnUpdateRecord = jest.fn();
  const mockRecordIdsByGroupFamilyState = jest.fn();

  const createDropResult = (destination?: {
    droppableId: string;
    index: number;
  }): DropResult => ({
    draggableId: 'record-1',
    type: 'DEFAULT',
    source: {
      droppableId: 'group-1',
      index: 0,
    },
    destination: destination ?? null,
    reason: 'DROP',
    mode: 'FLUID',
    combine: null,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Early returns', () => {
    it('should return early when destination is not defined', () => {
      const result = createDropResult();

      processGroupDragOperation({
        result,
        snapshot: mockSnapshot,
        selectedRecordIds: ['record-1'],
        selectFieldName: 'status',
        recordIdsByGroupFamilyState: mockRecordIdsByGroupFamilyState,
        onUpdateRecord: mockOnUpdateRecord,
      });

      expect(mockGetSnapshotValue).not.toHaveBeenCalled();
      expect(mockOnUpdateRecord).not.toHaveBeenCalled();
    });

    it('should throw error when record group is not defined', () => {
      const result = createDropResult({ droppableId: 'group-2', index: 1 });

      mockGetSnapshotValue.mockReturnValueOnce(undefined);

      expect(() => {
        processGroupDragOperation({
          result,
          snapshot: mockSnapshot,
          selectedRecordIds: ['record-1'],
          selectFieldName: 'status',
          recordIdsByGroupFamilyState: mockRecordIdsByGroupFamilyState,
          onUpdateRecord: mockOnUpdateRecord,
        });
      }).toThrow('Record group is not defined');
    });
  });

  describe('Single drag operation', () => {
    it('should process single drag operation successfully', () => {
      const result = createDropResult({ droppableId: 'group-2', index: 1 });
      const mockRecordGroup = {
        value: 'in-progress',
        fieldMetadataId: 'field-1',
      };
      const mockDestinationRecordIds = ['record-2', 'record-3'];
      const mockRecordPositionData = [
        { recordId: 'record-2', position: 1 },
        { recordId: 'record-3', position: 2 },
      ];

      mockGetSnapshotValue
        .mockReturnValueOnce(mockRecordGroup)
        .mockReturnValueOnce(mockDestinationRecordIds);

      mockExtractRecordPositions.mockReturnValue(mockRecordPositionData);
      mockGetDragOperationType.mockReturnValue('single');
      mockProcessSingleDrag.mockReturnValue({
        recordId: 'record-1',
        position: 1.5,
        groupValue: 'in-progress',
      });

      processGroupDragOperation({
        result,
        snapshot: mockSnapshot,
        selectedRecordIds: ['record-1'],
        selectFieldName: 'status',
        recordIdsByGroupFamilyState: mockRecordIdsByGroupFamilyState,
        onUpdateRecord: mockOnUpdateRecord,
      });

      expect(mockGetDragOperationType).toHaveBeenCalledWith({
        draggedRecordId: 'record-1',
        selectedRecordIds: ['record-1'],
      });

      expect(mockProcessSingleDrag).toHaveBeenCalledWith({
        result,
        recordPositionData: mockRecordPositionData,
        recordIds: mockDestinationRecordIds,
        groupValue: 'in-progress',
        selectFieldName: 'status',
      });

      expect(mockOnUpdateRecord).toHaveBeenCalledWith({
        recordId: 'record-1',
        position: 1.5,
        groupValue: 'in-progress',
        selectFieldName: 'status',
      });
    });

    it('should return early when single drag has no position', () => {
      const result = createDropResult({ droppableId: 'group-2', index: 1 });
      const mockRecordGroup = { value: 'done', fieldMetadataId: 'field-1' };
      const mockDestinationRecordIds = ['record-2'];

      mockGetSnapshotValue
        .mockReturnValueOnce(mockRecordGroup)
        .mockReturnValueOnce(mockDestinationRecordIds);

      mockExtractRecordPositions.mockReturnValue([]);
      mockGetDragOperationType.mockReturnValue('single');
      mockProcessSingleDrag.mockReturnValue({
        recordId: 'record-1',
        position: undefined,
        groupValue: 'done',
      });

      processGroupDragOperation({
        result,
        snapshot: mockSnapshot,
        selectedRecordIds: ['record-1'],
        selectFieldName: 'status',
        recordIdsByGroupFamilyState: mockRecordIdsByGroupFamilyState,
        onUpdateRecord: mockOnUpdateRecord,
      });

      expect(mockOnUpdateRecord).not.toHaveBeenCalled();
    });
  });

  describe('Multi drag operation', () => {
    it('should process multi drag operation successfully', () => {
      const result = createDropResult({ droppableId: 'group-2', index: 1 });
      const mockRecordGroup = {
        value: 'in-review',
        fieldMetadataId: 'field-1',
      };
      const mockDestinationRecordIds = ['record-4', 'record-5'];
      const mockRecordPositionData = [
        { recordId: 'record-4', position: 1 },
        { recordId: 'record-5', position: 2 },
      ];
      const selectedRecordIds = ['record-1', 'record-2', 'record-3'];

      mockGetSnapshotValue
        .mockReturnValueOnce(mockRecordGroup)
        .mockReturnValueOnce(mockDestinationRecordIds);

      mockExtractRecordPositions.mockReturnValue(mockRecordPositionData);
      mockGetDragOperationType.mockReturnValue('multi');
      mockProcessMultiDrag.mockReturnValue({
        recordUpdates: [
          { recordId: 'record-1', position: 1.3 },
          { recordId: 'record-2', position: 1.6 },
          { recordId: 'record-3', position: 1.9 },
        ],
      });

      processGroupDragOperation({
        result,
        snapshot: mockSnapshot,
        selectedRecordIds,
        selectFieldName: 'priority',
        recordIdsByGroupFamilyState: mockRecordIdsByGroupFamilyState,
        onUpdateRecord: mockOnUpdateRecord,
      });

      expect(mockGetDragOperationType).toHaveBeenCalledWith({
        draggedRecordId: 'record-1',
        selectedRecordIds,
      });

      expect(mockProcessMultiDrag).toHaveBeenCalledWith({
        result,
        selectedRecordIds,
        recordPositionData: mockRecordPositionData,
        recordIds: mockDestinationRecordIds,
        groupValue: 'in-review',
        selectFieldName: 'priority',
      });

      expect(mockOnUpdateRecord).toHaveBeenCalledTimes(3);
      expect(mockOnUpdateRecord).toHaveBeenNthCalledWith(1, {
        recordId: 'record-1',
        position: 1.3,
        groupValue: 'in-review',
        selectFieldName: 'priority',
      });
      expect(mockOnUpdateRecord).toHaveBeenNthCalledWith(2, {
        recordId: 'record-2',
        position: 1.6,
        groupValue: 'in-review',
        selectFieldName: 'priority',
      });
      expect(mockOnUpdateRecord).toHaveBeenNthCalledWith(3, {
        recordId: 'record-3',
        position: 1.9,
        groupValue: 'in-review',
        selectFieldName: 'priority',
      });
    });

    it('should handle empty multi drag result', () => {
      const result = createDropResult({ droppableId: 'group-2', index: 0 });
      const mockRecordGroup = { value: null, fieldMetadataId: 'field-1' };
      const mockDestinationRecordIds: string[] = [];

      mockGetSnapshotValue
        .mockReturnValueOnce(mockRecordGroup)
        .mockReturnValueOnce(mockDestinationRecordIds);

      mockExtractRecordPositions.mockReturnValue([]);
      mockGetDragOperationType.mockReturnValue('multi');
      mockProcessMultiDrag.mockReturnValue({
        recordUpdates: [],
      });

      processGroupDragOperation({
        result,
        snapshot: mockSnapshot,
        selectedRecordIds: ['record-1', 'record-2'],
        selectFieldName: 'category',
        recordIdsByGroupFamilyState: mockRecordIdsByGroupFamilyState,
        onUpdateRecord: mockOnUpdateRecord,
      });

      expect(mockOnUpdateRecord).not.toHaveBeenCalled();
    });
  });

  describe('Group value handling', () => {
    it('should handle null group value correctly', () => {
      const result = createDropResult({ droppableId: 'no-group', index: 0 });
      const mockRecordGroup = { value: null, fieldMetadataId: 'field-1' };
      const mockDestinationRecordIds = ['record-1'];

      mockGetSnapshotValue
        .mockReturnValueOnce(mockRecordGroup)
        .mockReturnValueOnce(mockDestinationRecordIds);

      mockExtractRecordPositions.mockReturnValue([]);
      mockGetDragOperationType.mockReturnValue('single');
      mockProcessSingleDrag.mockReturnValue({
        recordId: 'record-1',
        position: 1,
        groupValue: null,
      });

      processGroupDragOperation({
        result,
        snapshot: mockSnapshot,
        selectedRecordIds: ['record-1'],
        selectFieldName: 'status',
        recordIdsByGroupFamilyState: mockRecordIdsByGroupFamilyState,
        onUpdateRecord: mockOnUpdateRecord,
      });

      expect(mockOnUpdateRecord).toHaveBeenCalledWith({
        recordId: 'record-1',
        position: 1,
        groupValue: null,
        selectFieldName: 'status',
      });
    });

    it('should pass correct group value to processors', () => {
      const result = createDropResult({
        droppableId: 'custom-group',
        index: 2,
      });
      const mockRecordGroup = {
        value: 'custom-value',
        fieldMetadataId: 'field-custom',
      };
      const mockDestinationRecordIds = ['record-a', 'record-b', 'record-c'];

      mockGetSnapshotValue
        .mockReturnValueOnce(mockRecordGroup)
        .mockReturnValueOnce(mockDestinationRecordIds);

      mockExtractRecordPositions.mockReturnValue([]);
      mockGetDragOperationType.mockReturnValue('single');
      mockProcessSingleDrag.mockReturnValue({
        recordId: 'record-1',
        position: 2.5,
      });

      processGroupDragOperation({
        result,
        snapshot: mockSnapshot,
        selectedRecordIds: ['record-1'],
        selectFieldName: 'customField',
        recordIdsByGroupFamilyState: mockRecordIdsByGroupFamilyState,
        onUpdateRecord: mockOnUpdateRecord,
      });

      expect(mockProcessSingleDrag).toHaveBeenCalledWith(
        expect.objectContaining({
          groupValue: 'custom-value',
          selectFieldName: 'customField',
        }),
      );
    });
  });
});
