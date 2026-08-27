import {
  RecordTableWidgetContext,
  type RecordTableWidgetContextValue,
} from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { useUpdateViewKanbanColumnWidth } from '@/views/hooks/useUpdateViewKanbanColumnWidth';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

const mockPerformViewAPIUpdate = jest.fn();

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

describe('useUpdateViewKanbanColumnWidth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates the widget draft in page layout edit mode', async () => {
    const contextValue = getWidgetContext(true);
    const { result } = renderHook(() => useUpdateViewKanbanColumnWidth(), {
      wrapper: getWrapper(contextValue),
    });

    await act(async () => {
      await result.current.updateViewKanbanColumnWidth(360);
    });

    expect(contextValue.updateViewDraft).toHaveBeenCalledWith({
      kanbanColumnWidth: 360,
    });
    expect(mockPerformViewAPIUpdate).not.toHaveBeenCalled();
  });

  it('does not update a live widget', async () => {
    const contextValue = getWidgetContext(false);
    const { result } = renderHook(() => useUpdateViewKanbanColumnWidth(), {
      wrapper: getWrapper(contextValue),
    });

    await act(async () => {
      await result.current.updateViewKanbanColumnWidth(360);
    });

    expect(contextValue.updateViewDraft).not.toHaveBeenCalled();
    expect(mockPerformViewAPIUpdate).not.toHaveBeenCalled();
  });

  it('keeps persisting width changes for a regular view', async () => {
    const { result } = renderHook(() => useUpdateViewKanbanColumnWidth(), {
      wrapper: getWrapper(null),
    });

    await act(async () => {
      await result.current.updateViewKanbanColumnWidth(360);
    });

    expect(mockPerformViewAPIUpdate).toHaveBeenCalledWith({
      id: 'view-id',
      input: { kanbanColumnWidth: 360 },
    });
  });
});
