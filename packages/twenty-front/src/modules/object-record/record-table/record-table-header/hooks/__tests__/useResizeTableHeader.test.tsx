import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { useIsRecordTableCheckboxColumnHidden } from '@/object-record/record-table/hooks/useIsRecordTableCheckboxColumnHidden';
import { useResizeTableHeader } from '@/object-record/record-table/record-table-header/hooks/useResizeTableHeader';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSaveRecordFields } from '@/views/hooks/useSaveRecordFields';
import { act, renderHook } from '@testing-library/react';
import { useStore } from 'jotai';
import { type ReactNode } from 'react';

jest.mock('@/object-record/record-field/hooks/useUpdateRecordField');
jest.mock('@/object-record/record-table/contexts/RecordTableContext');
jest.mock(
  '@/object-record/record-table/hooks/internal/useResetTableRowSelection',
);
jest.mock(
  '@/object-record/record-table/hooks/useIsRecordTableCheckboxColumnHidden',
);
jest.mock('@/ui/utilities/drag-select/hooks/useDragSelect');
jest.mock('@/ui/utilities/pointer-event/hooks/useTrackPointer');
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState',
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentState');
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue');
jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomComponentState');
jest.mock('@/views/hooks/useSaveRecordFields');
jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useStore: jest.fn(),
}));

const FIELD_METADATA_ID = 'field-metadata-id';
const VIEW_FIELD_ID = 'view-field-id';
const PAGE_LAYOUT_ID = 'page-layout-id';
const WIDGET_ID = 'widget-id';

const recordField: RecordField = {
  id: VIEW_FIELD_ID,
  fieldMetadataItemId: FIELD_METADATA_ID,
  position: 0,
  isVisible: true,
  size: 100,
  aggregateOperation: null,
};

const updatedRecordField = { ...recordField, size: 120 };
const updateRecordField = jest.fn(() => updatedRecordField);
const saveRecordFields = jest.fn();
const updateViewDraftField = jest.fn();
const updateViewDraft = jest.fn();
let pointerHandlers: Parameters<typeof useTrackPointer>[0];

const getWrapper = (isPageLayoutInEditMode?: boolean) =>
  function Wrapper({ children }: { children: ReactNode }) {
    if (isPageLayoutInEditMode === undefined) {
      return children;
    }

    return (
      <RecordTableWidgetContext.Provider
        value={{
          isPageLayoutInEditMode,
          pageLayoutId: PAGE_LAYOUT_ID,
          widgetId: WIDGET_ID,
          updateViewDraftField,
          updateViewDraft,
        }}
      >
        {children}
      </RecordTableWidgetContext.Provider>
    );
  };

describe('useResizeTableHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useRecordTableContextOrThrow).mockReturnValue({
      recordTableId: 'record-table-id',
      visibleRecordFields: [recordField],
    } as ReturnType<typeof useRecordTableContextOrThrow>);
    jest.mocked(useResetTableRowSelection).mockReturnValue({
      resetTableRowSelection: jest.fn(),
    });
    jest.mocked(useIsRecordTableCheckboxColumnHidden).mockReturnValue(false);
    jest
      .mocked(useAtomComponentStateCallbackState)
      .mockReturnValue({} as never);
    jest
      .mocked(useAtomComponentState)
      .mockReturnValue([FIELD_METADATA_ID, jest.fn()]);
    jest.mocked(useAtomComponentStateValue).mockReturnValue(false);
    jest.mocked(useSetAtomComponentState).mockReturnValue(jest.fn());
    jest.mocked(useUpdateRecordField).mockReturnValue({ updateRecordField });
    jest.mocked(useSaveRecordFields).mockReturnValue({ saveRecordFields });
    jest.mocked(useDragSelect).mockReturnValue({
      isDragSelectionStartEnabled: jest.fn(() => true),
      setDragSelectionStartEnabled: jest.fn(),
    });
    jest.mocked(useStore).mockReturnValue({
      get: jest.fn(() => 20),
      set: jest.fn(),
    } as never);
    jest.mocked(useTrackPointer).mockImplementation((handlers) => {
      pointerHandlers = handlers;
    });
  });

  const finishResize = async (isPageLayoutInEditMode?: boolean) => {
    renderHook(() => useResizeTableHeader(), {
      wrapper: getWrapper(isPageLayoutInEditMode),
    });

    await act(async () => {
      await pointerHandlers.onMouseUp?.({
        x: 0,
        y: 0,
        event: new MouseEvent('mouseup'),
      });
    });
  };

  it('updates the page-layout draft in a widget editor', async () => {
    await finishResize(true);

    expect(updateViewDraftField).toHaveBeenCalledWith(VIEW_FIELD_ID, {
      size: 120,
    });
    expect(saveRecordFields).not.toHaveBeenCalled();
  });

  it('does not persist width changes from a live widget', async () => {
    await finishResize(false);

    expect(updateViewDraftField).not.toHaveBeenCalled();
    expect(saveRecordFields).not.toHaveBeenCalled();
  });

  it('keeps API persistence for regular views', async () => {
    await finishResize();

    expect(saveRecordFields).toHaveBeenCalledWith([updatedRecordField]);
    expect(updateViewDraftField).not.toHaveBeenCalled();
  });
});
