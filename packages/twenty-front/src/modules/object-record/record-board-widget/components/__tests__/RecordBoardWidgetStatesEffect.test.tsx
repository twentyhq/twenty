import { RecordBoardWidgetStatesEffect } from '@/object-record/record-board-widget/components/RecordBoardWidgetStatesEffect';
import { isRecordBoardCellsNonEditableComponentState } from '@/object-record/record-board/states/isRecordBoardCellsNonEditableComponentState';
import { isRecordBoardViewSettingsReadOnlyComponentState } from '@/object-record/record-board/states/isRecordBoardViewSettingsReadOnlyComponentState';
import { render, waitFor } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

const RECORD_BOARD_ID = 'record-board-id';

const renderEffect = (isUIEditable: boolean) => {
  const store = createStore();

  render(
    <JotaiProvider store={store}>
      <RecordBoardWidgetStatesEffect
        recordBoardId={RECORD_BOARD_ID}
        isUIEditable={isUIEditable}
      />
    </JotaiProvider>,
  );

  return store;
};

describe('RecordBoardWidgetStatesEffect', () => {
  it.each([
    [true, false],
    [false, true],
  ])(
    'keeps view settings read-only when record editing is %s',
    async (isUIEditable, expectedCellsNonEditable) => {
      const store = renderEffect(isUIEditable);

      await waitFor(() => {
        expect(
          store.get(
            isRecordBoardCellsNonEditableComponentState.atomFamily({
              instanceId: RECORD_BOARD_ID,
            }),
          ),
        ).toBe(expectedCellsNonEditable);
        expect(
          store.get(
            isRecordBoardViewSettingsReadOnlyComponentState.atomFamily({
              instanceId: RECORD_BOARD_ID,
            }),
          ),
        ).toBe(true);
      });
    },
  );
});
