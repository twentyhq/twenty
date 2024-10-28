import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { textfieldDefinition } from '@/object-record/record-field/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import {
  recordTableCell,
  recordTableRow,
} from '@/object-record/record-table/record-table-cell/hooks/__mocks__/cell';
import { useCloseRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useCloseRecordTableCell';
import { RecordTableScope } from '@/object-record/record-table/scopes/RecordTableScope';
import { currentTableCellInEditModePositionComponentState } from '@/object-record/record-table/states/currentTableCellInEditModePositionComponentState';
import { isTableCellInEditModeComponentFamilyState } from '@/object-record/record-table/states/isTableCellInEditModeComponentFamilyState';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

const setHotkeyScope = jest.fn();

jest.mock('@/ui/utilities/hotkey/hooks/useSetHotkeyScope', () => ({
  useSetHotkeyScope: () => setHotkeyScope,
}));

const onColumnsChange = jest.fn();
const recordTableId = 'scopeId';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>
    <RecordTableScope
      recordTableId={recordTableId}
      onColumnsChange={onColumnsChange}
    >
      <FieldContext.Provider
        value={{
          fieldDefinition: textfieldDefinition,
          recordId: 'recordId',
          hotkeyScope: TableHotkeyScope.Table,
          isLabelIdentifier: false,
        }}
      >
        <RecordTableRowContext.Provider value={recordTableRow}>
          <RecordTableCellContext.Provider
            value={{ ...recordTableCell, columnIndex: 0 }}
          >
            {children}
          </RecordTableCellContext.Provider>
        </RecordTableRowContext.Provider>
      </FieldContext.Provider>
    </RecordTableScope>
  </RecoilRoot>
);

describe('useCloseRecordTableCell', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => {
        const currentTableCellInEditModePosition = useRecoilComponentValueV2(
          currentTableCellInEditModePositionComponentState,
        );
        const isTableCellInEditMode = useRecoilComponentFamilyValueV2(
          isTableCellInEditModeComponentFamilyState,
          currentTableCellInEditModePosition,
        );
        return {
          ...useCloseRecordTableCell(),
          ...useDragSelect(),
          isTableCellInEditMode,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      result.current.closeTableCell();
    });

    expect(result.current.isDragSelectionStartEnabled()).toBe(true);
    expect(result.current.isTableCellInEditMode).toBe(false);
    expect(setHotkeyScope).toHaveBeenCalledWith('table-soft-focus');
  });
});
