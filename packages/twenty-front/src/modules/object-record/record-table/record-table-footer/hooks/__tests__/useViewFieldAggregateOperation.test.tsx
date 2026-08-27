import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { useViewFieldAggregateOperation } from '@/object-record/record-table/record-table-footer/hooks/useViewFieldAggregateOperation';
import { constructViewFromRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/constructViewFromRecordTableWidgetViewSnapshot';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';

jest.mock(
  '@/page-layout/widgets/record-table/utils/constructViewFromRecordTableWidgetViewSnapshot',
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue');
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue');
jest.mock('@/views/hooks/internal/usePerformViewFieldAPIPersist');
jest.mock('@/views/hooks/useGetCurrentViewOnly');

const WIDGET_ID = 'widget-id';
const PAGE_LAYOUT_ID = 'page-layout-id';
const view = mockedViews[0]!;
const viewField = view.viewFields[0]!;

const performViewFieldAPIUpdate = jest.fn();
const updateViewDraftField = jest.fn();
const updateViewDraft = jest.fn();

const getWidgetContextValue = (isPageLayoutInEditMode: boolean) => ({
  isPageLayoutInEditMode,
  pageLayoutId: PAGE_LAYOUT_ID,
  widgetId: WIDGET_ID,
  updateViewDraftField,
  updateViewDraft,
});

const getWrapper = (isPageLayoutInEditMode?: boolean) =>
  function Wrapper({ children }: { children: ReactNode }) {
    const content = (
      <RecordTableColumnAggregateFooterDropdownContext.Provider
        value={{
          currentContentId: null,
          onContentChange: jest.fn(),
          resetContent: jest.fn(),
          dropdownId: 'aggregate-dropdown-id',
          fieldMetadataId: viewField.fieldMetadataId,
        }}
      >
        {children}
      </RecordTableColumnAggregateFooterDropdownContext.Provider>
    );

    return isPageLayoutInEditMode === undefined ? (
      content
    ) : (
      <RecordTableWidgetContext.Provider
        value={getWidgetContextValue(isPageLayoutInEditMode)}
      >
        {content}
      </RecordTableWidgetContext.Provider>
    );
  };

describe('useViewFieldAggregateOperation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useGetCurrentViewOnly).mockReturnValue({ currentView: view });
    jest.mocked(usePerformViewFieldAPIPersist).mockReturnValue({
      performViewFieldAPIUpdate,
      performViewFieldAPICreate: jest.fn(),
      performViewFieldAPIDelete: jest.fn(),
      performViewFieldAPIDestroy: jest.fn(),
    });
    jest.mocked(useAtomComponentStateValue).mockReturnValue({
      [WIDGET_ID]: {},
    });
    jest.mocked(useAtomFamilyStateValue).mockReturnValue(null);
    jest
      .mocked(constructViewFromRecordTableWidgetViewSnapshot)
      .mockReturnValue(view);
  });

  it('updates the page-layout draft in a widget editor', async () => {
    const { result } = renderHook(() => useViewFieldAggregateOperation(), {
      wrapper: getWrapper(true),
    });

    await act(async () => {
      await result.current.updateViewFieldAggregateOperation(
        AggregateOperations.SUM,
      );
    });

    expect(updateViewDraftField).toHaveBeenCalledWith(viewField.id, {
      aggregateOperation: AggregateOperations.SUM,
    });
    expect(performViewFieldAPIUpdate).not.toHaveBeenCalled();
  });

  it('does not persist aggregate changes from a live widget', async () => {
    const { result } = renderHook(() => useViewFieldAggregateOperation(), {
      wrapper: getWrapper(false),
    });

    await act(async () => {
      await result.current.updateViewFieldAggregateOperation(
        AggregateOperations.SUM,
      );
    });

    expect(updateViewDraftField).not.toHaveBeenCalled();
    expect(performViewFieldAPIUpdate).not.toHaveBeenCalled();
  });

  it('keeps API persistence for regular views', async () => {
    const { result } = renderHook(() => useViewFieldAggregateOperation(), {
      wrapper: getWrapper(),
    });

    await act(async () => {
      await result.current.updateViewFieldAggregateOperation(
        AggregateOperations.SUM,
      );
    });

    expect(performViewFieldAPIUpdate).toHaveBeenCalledWith([
      {
        input: {
          id: viewField.id,
          update: {
            isVisible: viewField.isVisible,
            position: viewField.position,
            size: viewField.size,
            aggregateOperation: AggregateOperations.SUM,
          },
        },
      },
    ]);
    expect(updateViewDraftField).not.toHaveBeenCalled();
  });
});
