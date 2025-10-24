import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { usePersistView } from '@/views/hooks/internal/usePersistView';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { renderHook } from '@testing-library/react';
import { useSetRecoilState } from 'recoil';
import { useUpdateViewAggregate } from '../useUpdateViewAggregate';

jest.mock('@/ui/utilities/state/component-state/hooks/useRecoilComponentValue');
jest.mock('@/views/hooks/internal/usePersistView');
jest.mock('@/views/hooks/useRefreshCoreViewsByObjectMetadataId');
jest.mock('recoil');
describe('useUpdateViewAggregate', () => {
  const mockCurrentViewId = 'test-view-id';
  const mockUpdateView = jest.fn();
  const mockSetRecordIndexKanbanAggregateOperationState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRecoilComponentValue as jest.Mock).mockReturnValue(mockCurrentViewId);
    (usePersistView as jest.Mock).mockReturnValue({
      updateView: mockUpdateView,
    });
    (useSetRecoilState as jest.Mock).mockReturnValue(
      mockSetRecordIndexKanbanAggregateOperationState,
    );
    (useRefreshCoreViewsByObjectMetadataId as jest.Mock).mockReturnValue({
      refreshCoreViewsByObjectMetadataId: jest.fn(),
    });
  });

  describe('Aggregate operations on dates', () => {
    it('should update view with rightfully converted values', () => {
      const { result } = renderHook(() => useUpdateViewAggregate());

      result.current.updateViewAggregate({
        kanbanAggregateOperationFieldMetadataId: 'test-field-id',
        kanbanAggregateOperation: DateAggregateOperations.EARLIEST,
        objectMetadataId: 'test-object-metadata-id',
      });

      // updateView is called with 'EARLIEST' converted to 'MIN'
      expect(mockUpdateView).toHaveBeenCalledWith({
        id: mockCurrentViewId,
        input: {
          kanbanAggregateOperationFieldMetadataId: 'test-field-id',
          kanbanAggregateOperation: AggregateOperations.MIN,
        },
      });

      // setAggregateOperation is called with 'EARLIEST'
      expect(
        mockSetRecordIndexKanbanAggregateOperationState,
      ).toHaveBeenCalledWith({
        operation: DateAggregateOperations.EARLIEST,
        fieldMetadataId: 'test-field-id',
      });
    });
  });
});
