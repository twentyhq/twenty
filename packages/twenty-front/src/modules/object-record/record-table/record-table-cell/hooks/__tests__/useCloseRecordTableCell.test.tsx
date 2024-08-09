import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { textfieldDefinition } from '@/object-record/record-field/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import {
  recordTableCell,
  recordTableRow,
} from '@/object-record/record-table/record-table-cell/hooks/__mocks__/cell';
import { useCloseRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useCloseRecordTableCell';
import { RecordTableScope } from '@/object-record/record-table/scopes/RecordTableScope';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';

const setHotkeyScope = jest.fn();

jest.mock('@/ui/utilities/hotkey/hooks/useSetHotkeyScope', () => ({
  useSetHotkeyScope: () => setHotkeyScope,
}));

const onColumnsChange = jest.fn();
const scopeId = 'scopeId';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>
    <RecordTableScope
      recordTableScopeId={scopeId}
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
        const {
          currentTableCellInEditModePositionState,
          isTableCellInEditModeFamilyState,
        } = useRecordTableStates();
        const currentTableCellInEditModePosition = useRecoilValue(
          currentTableCellInEditModePositionState,
        );
        const isTableCellInEditMode = useRecoilValue(
          isTableCellInEditModeFamilyState(currentTableCellInEditModePosition),
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
