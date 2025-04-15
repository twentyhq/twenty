import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { CallbackInterface, RecoilRoot } from 'recoil';

import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import {
  recordTableCellContextValue,
  recordTableRowContextValue,
  recordTableRowDraggableContextValue,
} from '@/object-record/record-table/record-table-cell/hooks/__mocks__/cell';
import { useMoveHoverToCurrentCell } from '@/object-record/record-table/record-table-cell/hooks/useMoveHoverToCurrentCell';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';

const mockFocusPositionState = {
  key: 'focusPositionComponentState__{"instanceId":"scopeId"}',
};
const mockFocusActiveState = {
  key: 'isFocusActiveComponentState__{"instanceId":"scopeId"}',
};
const mockIsFocusOnTableCellFamilyStateCurrentPosition = {
  key: 'isFocusOnTableCellComponentFamilyState__{"familyKey":{"column":1,"row":0},"instanceId":"scopeId"}',
};
const mockIsFocusOnTableCellFamilyStateNewPosition = {
  key: 'isFocusOnTableCellComponentFamilyState__{"familyKey":{"column":3,"row":2},"instanceId":"scopeId"}',
};
const mockCurrentTableCellInEditModePositionState = {
  key: 'currentTableCellInEditModePositionComponentState__{"instanceId":"scopeId"}',
};
const mockIsTableCellInEditModeFamilyState = {
  key: 'isTableCellInEditModeComponentFamilyState__{"familyKey":{"column":1,"row":0},"instanceId":"scopeId"}',
};
const mockCurrentHotKeyScopeState = {
  key: 'currentHotkeyScopeState',
};

const mockCallbackInterface = {
  set: jest.fn(),
  snapshot: {
    getLoadable: (recoilValue: { key: string }) => ({
      getValue: () => {
        if (recoilValue.key === mockFocusPositionState.key)
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

const setFocusPosition = jest.fn();
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
jest.mock('@/object-record/record-table/hooks/useRecordTable', () => ({
  useRecordTable: () => ({
    setFocusPosition,
    setOnColumnsChange,
  }),
}));
jest.mock('@/ui/utilities/hotkey/hooks/useSetHotkeyScope', () => ({
  useSetHotkeyScope: () => setHotkeyScope,
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>
    <RecordTableComponentInstance
      recordTableId="scopeId"
      onColumnsChange={jest.fn()}
    >
      <RecordTableRowContextProvider value={recordTableRowContextValue}>
        <RecordTableRowDraggableContextProvider
          value={recordTableRowDraggableContextValue}
        >
          <RecordTableCellContext.Provider value={recordTableCellContextValue}>
            {children}
          </RecordTableCellContext.Provider>
        </RecordTableRowDraggableContextProvider>
      </RecordTableRowContextProvider>
    </RecordTableComponentInstance>
  </RecoilRoot>
);

describe('useMoveFocusToCurrentCellOnHover', () => {
  it('should work as expected', () => {
    const { result } = renderHook(() => useMoveHoverToCurrentCell('scopeId'), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.moveFocusToCurrentCell({
        column: 3,
        row: 2,
      });
    });

    expect(mockCallbackInterface.set).toHaveBeenNthCalledWith(
      1,
      mockFocusActiveState,
      true,
    );

    expect(mockCallbackInterface.set).toHaveBeenNthCalledWith(
      2,
      mockIsFocusOnTableCellFamilyStateCurrentPosition,
      false,
    );

    expect(mockCallbackInterface.set).toHaveBeenNthCalledWith(
      3,
      mockFocusPositionState,
      { column: 3, row: 2 },
    );

    expect(mockCallbackInterface.set).toHaveBeenNthCalledWith(
      4,
      mockIsFocusOnTableCellFamilyStateNewPosition,
      true,
    );

    expect(mockCallbackInterface.set).toHaveBeenNthCalledWith(
      5,
      mockFocusActiveState,
      true,
    );

    expect(setHotkeyScope).toHaveBeenCalledWith(TableHotkeyScope.TableFocus);
  });
});
