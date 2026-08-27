import { RecordTableWidgetStatesEffect } from '@/object-record/record-table-widget/components/RecordTableWidgetStatesEffect';
import { isRecordTableCellsNonEditableComponentState } from '@/object-record/record-table/states/isRecordTableCellsNonEditableComponentState';
import { isRecordTableCheckboxColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableCheckboxColumnHiddenComponentState';
import { isRecordTableColumnHeadersReadOnlyComponentState } from '@/object-record/record-table/states/isRecordTableColumnHeadersReadOnlyComponentState';
import { isRecordTableColumnResizableComponentState } from '@/object-record/record-table/states/isRecordTableColumnResizableComponentState';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { isRecordTableEmptyStateHiddenComponentState } from '@/object-record/record-table/states/isRecordTableEmptyStateHiddenComponentState';
import { render, waitFor } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

const RECORD_TABLE_ID = 'record-table-id';

const renderEffect = ({
  isUIEditable,
  isPageLayoutInEditMode,
}: {
  isUIEditable: boolean;
  isPageLayoutInEditMode: boolean;
}) => {
  const store = createStore();

  const { unmount } = render(
    <JotaiProvider store={store}>
      <RecordTableWidgetStatesEffect
        recordTableId={RECORD_TABLE_ID}
        isUIEditable={isUIEditable}
        isPageLayoutInEditMode={isPageLayoutInEditMode}
      />
    </JotaiProvider>,
  );

  return { store, unmount };
};

describe('RecordTableWidgetStatesEffect', () => {
  it.each([
    [true, false, false],
    [false, false, true],
    [false, true, true],
  ])(
    'separates record editing %s from layout editing %s',
    async (isUIEditable, isPageLayoutInEditMode, expectedCellsNonEditable) => {
      const { store } = renderEffect({
        isUIEditable,
        isPageLayoutInEditMode,
      });

      await waitFor(() => {
        expect(
          store.get(
            isRecordTableCellsNonEditableComponentState.atomFamily({
              instanceId: RECORD_TABLE_ID,
            }),
          ),
        ).toBe(expectedCellsNonEditable);
        expect(
          store.get(
            isRecordTableColumnHeadersReadOnlyComponentState.atomFamily({
              instanceId: RECORD_TABLE_ID,
            }),
          ),
        ).toBe(true);
        expect(
          store.get(
            isRecordTableColumnResizableComponentState.atomFamily({
              instanceId: RECORD_TABLE_ID,
            }),
          ),
        ).toBe(isPageLayoutInEditMode);
      });
    },
  );

  it('restores regular table defaults on unmount', async () => {
    const { store, unmount } = renderEffect({
      isUIEditable: false,
      isPageLayoutInEditMode: false,
    });

    expect(
      store.get(
        isRecordTableDragColumnHiddenComponentState.atomFamily({
          instanceId: RECORD_TABLE_ID,
        }),
      ),
    ).toBe(true);

    unmount();

    expect(
      store.get(
        isRecordTableCellsNonEditableComponentState.atomFamily({
          instanceId: RECORD_TABLE_ID,
        }),
      ),
    ).toBe(false);
    expect(
      store.get(
        isRecordTableColumnHeadersReadOnlyComponentState.atomFamily({
          instanceId: RECORD_TABLE_ID,
        }),
      ),
    ).toBe(false);
    expect(
      store.get(
        isRecordTableColumnResizableComponentState.atomFamily({
          instanceId: RECORD_TABLE_ID,
        }),
      ),
    ).toBe(true);
    expect(
      store.get(
        isRecordTableDragColumnHiddenComponentState.atomFamily({
          instanceId: RECORD_TABLE_ID,
        }),
      ),
    ).toBe(false);
    expect(
      store.get(
        isRecordTableCheckboxColumnHiddenComponentState.atomFamily({
          instanceId: RECORD_TABLE_ID,
        }),
      ),
    ).toBe(false);
    expect(
      store.get(
        isRecordTableEmptyStateHiddenComponentState.atomFamily({
          instanceId: RECORD_TABLE_ID,
        }),
      ),
    ).toBe(false);
  });
});
