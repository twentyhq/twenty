import { act, renderHook } from '@testing-library/react';
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
import { useMoveSoftFocusToCurrentCellOnHover } from '@/object-record/record-table/record-table-cell/hooks/useMoveSoftFocusToCurrentCellOnHover';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';

const mockSoftFocusPositionState = {
  key: 'softFocusPositionComponentState__{"instanceId":"scopeId"}',
};
const mockSoftFocusActiveState = {
  key: 'isSoftFocusActiveComponentState__{"instanceId":"scopeId"}',
};
const mockIsSoftFocusOnTableCellFamilyStateCurrentPosition = {
  key: 'isSoftFocusOnTableCellComponentFamilyState__{"familyKey":{"column":1,"row":0},"instanceId":"scopeId"}',
};
const mockIsSoftFocusOnTableCellFamilyStateNewPosition = {
  key: 'isSoftFocusOnTableCellComponentFamilyState__{"familyKey":{"column":3,"row":2},"instanceId":"scopeId"}',
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

    expect(mockCallbackInterface.set).toHaveBeenNthCalledWith(
      1,
      mockSoftFocusActiveState,
      true,
    );

    expect(mockCallbackInterface.set).toHaveBeenNthCalledWith(
      2,
      mockIsSoftFocusOnTableCellFamilyStateCurrentPosition,
      false,
    );

    expect(mockCallbackInterface.set).toHaveBeenNthCalledWith(
      3,
      mockSoftFocusPositionState,
      { column: 3, row: 2 },
    );

    expect(mockCallbackInterface.set).toHaveBeenNthCalledWith(
      4,
      mockIsSoftFocusOnTableCellFamilyStateNewPosition,
      true,
    );

    expect(mockCallbackInterface.set).toHaveBeenNthCalledWith(
      5,
      mockSoftFocusActiveState,
      true,
    );

    expect(setHotkeyScope).toHaveBeenCalledWith(
      TableHotkeyScope.TableSoftFocus,
    );
  });
});
