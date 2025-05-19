import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/DateAggregateOperations';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useUpdateView } from '@/views/hooks/useUpdateView';
import { renderHook } from '@testing-library/react';
import { useSetRecoilState } from 'recoil';
import { useUpdateViewAggregate } from '../useUpdateViewAggregate';

jest.mock(
  '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2',
);
jest.mock('@/views/hooks/useUpdateView');
jest.mock('recoil');

describe('useUpdateViewAggregate', () => {
  const mockCurrentViewId = 'test-view-id';
  const mockUpdateView = jest.fn();
  const mockSetRecordIndexKanbanAggregateOperationState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRecoilComponentValueV2 as jest.Mock).mockReturnValue(mockCurrentViewId);
    (useUpdateView as jest.Mock).mockReturnValue({
      updateView: mockUpdateView,
    });
    (useSetRecoilState as jest.Mock).mockReturnValue(
      mockSetRecordIndexKanbanAggregateOperationState,
    );
  });

  describe('Aggregate operations on dates', () => {
    it('should update view with rightfully converted values', () => {
      const { result } = renderHook(() => useUpdateViewAggregate());

      result.current.updateViewAggregate({
        kanbanAggregateOperationFieldMetadataId: 'test-field-id',
        kanbanAggregateOperation: DATE_AGGREGATE_OPERATIONS.earliest,
      });

      // updateView is called with 'EARLIEST' converted to 'MIN'
      expect(mockUpdateView).toHaveBeenCalledWith({
        id: mockCurrentViewId,
        kanbanAggregateOperationFieldMetadataId: 'test-field-id',
        kanbanAggregateOperation: AGGREGATE_OPERATIONS.min,
      });

      // setAggregateOperation is called with 'EARLIEST'
      expect(
        mockSetRecordIndexKanbanAggregateOperationState,
      ).toHaveBeenCalledWith({
        operation: DATE_AGGREGATE_OPERATIONS.earliest,
        fieldMetadataId: 'test-field-id',
      });
    });
  });
});
