import {
  RecordTableWidgetContext,
  type RecordTableWidgetContextValue,
} from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useUpdateViewAggregate } from '@/views/hooks/useUpdateViewAggregate';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockLoadRecordIndexStates = jest.fn();
const mockPerformViewAPIUpdate = jest.fn();

jest.mock(
  '@/object-record/record-index/hooks/useLoadRecordIndexStates',
  () => ({
    useLoadRecordIndexStates: () => ({
      loadRecordIndexStates: mockLoadRecordIndexStates,
    }),
  }),
);

jest.mock('@/views/hooks/internal/usePerformViewAPIUpdate', () => ({
  usePerformViewAPIUpdate: () => ({
    performViewAPIUpdate: mockPerformViewAPIUpdate,
  }),
}));

jest.mock('@/views/hooks/useCanPersistViewChanges', () => ({
  useCanPersistViewChanges: () => ({ canPersistChanges: true }),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({ useAtomComponentStateValue: () => 'view-id' }),
);

const getWrapper = (contextValue: RecordTableWidgetContextValue | null) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <RecordTableWidgetContext.Provider value={contextValue}>
        {children}
      </RecordTableWidgetContext.Provider>
    );
  };

const getWidgetContext = (
  isPageLayoutInEditMode: boolean,
): RecordTableWidgetContextValue => ({
  isPageLayoutInEditMode,
  pageLayoutId: 'page-layout-id',
  widgetId: 'widget-id',
  updateViewDraft: jest.fn(),
  updateViewDraftField: jest.fn(),
});

const objectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const updateAggregate = async (
  updateViewAggregate: ReturnType<
    typeof useUpdateViewAggregate
  >['updateViewAggregate'],
) => {
  await updateViewAggregate({
    kanbanAggregateOperationFieldMetadataId: 'field-metadata-id',
    kanbanAggregateOperation: AggregateOperations.SUM,
    objectMetadataItem,
  });
};

describe('useUpdateViewAggregate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates the widget draft in page layout edit mode', async () => {
    const contextValue = getWidgetContext(true);
    const { result } = renderHook(() => useUpdateViewAggregate(), {
      wrapper: getWrapper(contextValue),
    });

    await act(async () => {
      await updateAggregate(result.current.updateViewAggregate);
    });

    expect(contextValue.updateViewDraft).toHaveBeenCalledWith({
      kanbanAggregateOperationFieldMetadataId: 'field-metadata-id',
      kanbanAggregateOperation: AggregateOperations.SUM,
    });
    expect(mockPerformViewAPIUpdate).not.toHaveBeenCalled();
  });

  it('does not update a live widget', async () => {
    const contextValue = getWidgetContext(false);
    const { result } = renderHook(() => useUpdateViewAggregate(), {
      wrapper: getWrapper(contextValue),
    });

    await act(async () => {
      await updateAggregate(result.current.updateViewAggregate);
    });

    expect(contextValue.updateViewDraft).not.toHaveBeenCalled();
    expect(mockPerformViewAPIUpdate).not.toHaveBeenCalled();
  });

  it('keeps persisting aggregate changes for a regular view', async () => {
    mockPerformViewAPIUpdate.mockResolvedValue({
      status: 'successful',
      response: { data: { updateView: { id: 'view-id' } } },
    });

    const { result } = renderHook(() => useUpdateViewAggregate(), {
      wrapper: getWrapper(null),
    });

    await act(async () => {
      await updateAggregate(result.current.updateViewAggregate);
    });

    expect(mockPerformViewAPIUpdate).toHaveBeenCalledWith({
      id: 'view-id',
      input: {
        kanbanAggregateOperationFieldMetadataId: 'field-metadata-id',
        kanbanAggregateOperation: AggregateOperations.SUM,
      },
    });
    expect(mockLoadRecordIndexStates).toHaveBeenCalledWith(
      { id: 'view-id' },
      objectMetadataItem,
    );
  });
});
