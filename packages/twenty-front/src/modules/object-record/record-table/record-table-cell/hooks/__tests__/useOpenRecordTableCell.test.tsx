import { MemoryRouter } from 'react-router-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { textfieldDefinition } from '@/object-record/record-field/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import {
  recordTableCell,
  recordTableRow,
} from '@/object-record/record-table/record-table-cell/hooks/__mocks__/cell';
import { useOpenRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCell';
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
          entityId: 'entityId',
          hotkeyScope: TableHotkeyScope.Table,
          isLabelIdentifier: false,
        }}
      >
        <RecordTableRowContext.Provider value={recordTableRow}>
          <RecordTableCellContext.Provider value={recordTableCell}>
            <MemoryRouter initialEntries={['/one', '/two']} initialIndex={1}>
              {children}
            </MemoryRouter>
          </RecordTableCellContext.Provider>
        </RecordTableRowContext.Provider>
      </FieldContext.Provider>
    </RecordTableScope>
  </RecoilRoot>
);

describe('useOpenRecordTableCell', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => {
        return { ...useOpenRecordTableCell(), ...useDragSelect() };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.isDragSelectionStartEnabled()).toBe(true);

    act(() => {
      result.current.openTableCell();
    });

    await waitFor(() => {
      expect(result.current.isDragSelectionStartEnabled()).toBe(false);
    });

    expect(setHotkeyScope).toHaveBeenCalledWith('cell-edit-mode', undefined);
  });
});
