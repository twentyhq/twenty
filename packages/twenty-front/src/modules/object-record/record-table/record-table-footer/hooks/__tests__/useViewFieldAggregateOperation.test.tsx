import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { useViewFieldAggregateOperation } from '@/object-record/record-table/record-table-footer/hooks/useViewFieldAggregateOperation';
import { AggregateOperations } from '~/generated-metadata/graphql';

const mockUseGetCurrentViewOnly = jest.fn();
const mockUseCanPersistViewChanges = jest.fn();
const mockPerformViewFieldAPIUpdate = jest.fn();

jest.mock('@/views/hooks/useGetCurrentViewOnly', () => ({
  useGetCurrentViewOnly: () => mockUseGetCurrentViewOnly(),
}));

jest.mock('@/views/hooks/useCanPersistViewChanges', () => ({
  useCanPersistViewChanges: () => mockUseCanPersistViewChanges(),
}));

jest.mock('@/views/hooks/internal/usePerformViewFieldAPIPersist', () => ({
  usePerformViewFieldAPIPersist: () => ({
    performViewFieldAPIUpdate: mockPerformViewFieldAPIUpdate,
  }),
}));

describe('useViewFieldAggregateOperation', () => {
  const fieldMetadataId = 'field-metadata-id';
  const viewFieldId = 'view-field-id';
  const currentViewField = {
    id: viewFieldId,
    fieldMetadataId,
    isVisible: true,
    position: 0,
    size: 150,
  };

  const renderUseViewFieldAggregateOperation = () => {
    const store = createStore();

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>
        <RecordTableColumnAggregateFooterDropdownContext.Provider
          value={{
            currentContentId: null,
            onContentChange: jest.fn(),
            resetContent: jest.fn(),
            dropdownId: 'aggregate-dropdown-id',
            fieldMetadataId,
          }}
        >
          {children}
        </RecordTableColumnAggregateFooterDropdownContext.Provider>
      </Provider>
    );

    return {
      store,
      ...renderHook(() => useViewFieldAggregateOperation(), { wrapper }),
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformViewFieldAPIUpdate.mockResolvedValue({ status: 'successful' });
    mockUseCanPersistViewChanges.mockReturnValue({ canPersistChanges: true });
    mockUseGetCurrentViewOnly.mockReturnValue({
      currentView: {
        viewFields: [currentViewField],
      },
    });
  });

  it('updates local aggregate state without persisting when current view changes cannot be persisted', async () => {
    mockUseCanPersistViewChanges.mockReturnValue({ canPersistChanges: false });

    const { result, store } = renderUseViewFieldAggregateOperation();

    await act(async () => {
      await result.current.updateViewFieldAggregateOperation(
        AggregateOperations.COUNT,
      );
    });

    expect(mockPerformViewFieldAPIUpdate).not.toHaveBeenCalled();
    expect(
      store.get(
        viewFieldAggregateOperationState.atomFamily({
          viewFieldId,
        }),
      ),
    ).toBe(AggregateOperations.COUNT);
  });

  it('persists aggregate changes when current view changes can be persisted', async () => {
    const { result } = renderUseViewFieldAggregateOperation();

    await act(async () => {
      await result.current.updateViewFieldAggregateOperation(
        AggregateOperations.COUNT,
      );
    });

    expect(mockPerformViewFieldAPIUpdate).toHaveBeenCalledWith([
      {
        input: {
          id: viewFieldId,
          update: {
            aggregateOperation: AggregateOperations.COUNT,
            isVisible: true,
            position: 0,
            size: 150,
          },
        },
      },
    ]);
  });
});
