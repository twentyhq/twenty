import { act, renderHook } from '@testing-library/react';
import { CallbackInterface, RecoilRoot } from 'recoil';

import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

import { useSelectedTableCellEditMode } from '../useSelectedTableCellEditMode';

const scopeId = 'yourScopeId';

const mockCallbackInterface = {
  set: jest.fn(),
  snapshot: {
    getLoadable: () => ({
      getValue: () => ({ row: 0, column: 0 }),
    }),
  },
} as unknown as CallbackInterface;

jest.mock('recoil', () => ({
  ...jest.requireActual('recoil'),
  useRecoilCallback: (
    callback: (
      _interface: CallbackInterface,
    ) => (newPosition: TableCellPosition) => void,
  ) => callback(mockCallbackInterface),
}));

describe('useSelectedTableCellEditMode', () => {
  it('should have property setSelectedTableCellEditMode', async () => {
    const tableCellPosition: TableCellPosition = {
      row: 1,
      column: 5,
    };

    const { result } = renderHook(
      () => useSelectedTableCellEditMode({ scopeId }),
      {
        wrapper: RecoilRoot,
      },
    );

    act(() => {
      result.current.setSelectedTableCellEditMode(
        tableCellPosition.row,
        tableCellPosition.column,
      );
    });

    expect(mockCallbackInterface.set).toHaveBeenCalledWith(
      {
        key: 'isTableCellInEditModeComponentFamilyState__{"familyKey":{"column":0,"row":0},"instanceId":"yourScopeId"}',
      },
      false,
    );

    expect(mockCallbackInterface.set).toHaveBeenCalledWith(
      {
        key: 'isTableCellInEditModeComponentFamilyState__{"familyKey":{"column":5,"row":1},"instanceId":"yourScopeId"}',
      },
      true,
    );
  });
});
