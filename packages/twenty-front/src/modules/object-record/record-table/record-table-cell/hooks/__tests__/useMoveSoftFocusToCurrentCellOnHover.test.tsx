import { act, renderHook } from '@testing-library/react';
import { CallbackInterface, RecoilRoot } from 'recoil';

import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import {
  recordTableCell,
  recordTableRow,
} from '@/object-record/record-table/record-table-cell/hooks/__mocks__/cell';
import { useMoveSoftFocusToCurrentCellOnHover } from '@/object-record/record-table/record-table-cell/hooks/useMoveSoftFocusToCurrentCellOnHover';
import { RecordTableScope } from '@/object-record/record-table/scopes/RecordTableScope';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';

const mockSoftFocusPositionState = {
  key: 'softFocusPositionComponentState__{"scopeId":"scopeId"}',
};
const mockSoftFocusActiveState = {
  key: 'isSoftFocusActiveComponentState__{"scopeId":"scopeId"}',
};
const mockIsSoftFocusOnTableCellFamilyState = {
  key: 'isSoftFocusOnTableCellFamilyComponentState__{"familyKey":{"column":1,"row":0},"scopeId":"scopeId"}',
};
const mockCurrentTableCellInEditModePositionState = {
  key: 'currentTableCellInEditModePositionComponentState__{"scopeId":"scopeId"}',
};
const mockIsTableCellInEditModeFamilyState = {
  key: 'isTableCellInEditModeFamilyComponentState__{"familyKey":{"column":1,"row":0},"scopeId":"scopeId"}',
};
const mockCurrentHotKeyScopeState = {
  key: 'currentHotkeyScopeState',
};

const mockCallbackInterface = {
  set: jest.fn(),
  snapshot: {
    getLoadable: (recoilValue: { key: string }) => ({
      getValue: () => {
        if (recoilValue.key === mockSoftFocusPositionState.key)
          return { column: 1, row: 0 };
        if (recoilValue.key === mockCurrentTableCellInEditModePositionState.key)
          return { column: 1, row: 0 };
        else if (recoilValue.key === mockIsTableCellInEditModeFamilyState.key)
          return false;
        else if (recoilValue.key === mockCurrentHotKeyScopeState.key)
          return { scope: TableHotkeyScope.Table };
      },
    }),
  },
} as unknown as CallbackInterface;

const setSoftFocusPosition = jest.fn();
const setOnColumnsChange = jest.fn();
const setHotkeyScope = jest.fn();

jest.mock('recoil', () => ({
  ...jest.requireActual('recoil'),
  useRecoilCallback: (
    callback: (
      _interface: CallbackInterface,
    ) => (newPosition: TableCellPosition) => void,
  ) => callback(mockCallbackInterface),
}));
jest.mock(
  '@/object-record/record-table/hooks/internal/useRecordTableStates',
  () => ({
    useRecordTableStates: () => ({
      softFocusPositionState: mockSoftFocusPositionState,
      isSoftFocusActiveState: mockSoftFocusActiveState,
      isSoftFocusOnTableCellFamilyState: () =>
        mockIsSoftFocusOnTableCellFamilyState,
      currentTableCellInEditModePositionState:
        mockCurrentTableCellInEditModePositionState,
      isTableCellInEditModeFamilyState: () =>
        mockIsTableCellInEditModeFamilyState,
    }),
  }),
);
jest.mock('@/object-record/record-table/hooks/useRecordTable', () => ({
  useRecordTable: () => ({
    setSoftFocusPosition,
    setOnColumnsChange,
  }),
}));
jest.mock('@/ui/utilities/hotkey/hooks/useSetHotkeyScope', () => ({
  useSetHotkeyScope: () => setHotkeyScope,
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>
    <RecordTableScope recordTableScopeId="scopeId" onColumnsChange={jest.fn()}>
      <RecordTableRowContext.Provider value={recordTableRow}>
        <RecordTableCellContext.Provider value={recordTableCell}>
          {children}
        </RecordTableCellContext.Provider>
      </RecordTableRowContext.Provider>
    </RecordTableScope>
  </RecoilRoot>
);

describe('useMoveSoftFocusToCurrentCellOnHover', () => {
  it('should work as expected', () => {
    const { result } = renderHook(
      () => {
        return {
          moveSoftFocusToCurrentCellOnHover:
            useMoveSoftFocusToCurrentCellOnHover(),
        };
      },
      { wrapper: Wrapper },
    );

    act(() => {
      result.current.moveSoftFocusToCurrentCellOnHover();
    });

    expect(mockCallbackInterface.set).toHaveBeenCalledWith(
      mockSoftFocusActiveState,
      true,
    );
    expect(mockCallbackInterface.set).toHaveBeenCalledWith(
      mockIsSoftFocusOnTableCellFamilyState,
      false,
    );
    expect(mockCallbackInterface.set).toHaveBeenCalledWith(
      mockSoftFocusPositionState,
      { column: 3, row: 2 },
    );
    expect(mockCallbackInterface.set).toHaveBeenCalledWith(
      mockIsSoftFocusOnTableCellFamilyState,
      true,
    );
    expect(mockCallbackInterface.set).toHaveBeenCalledWith(
      mockSoftFocusActiveState,
      true,
    );
    expect(setHotkeyScope).toHaveBeenCalledWith(
      TableHotkeyScope.TableSoftFocus,
    );
  });
});
