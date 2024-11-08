import { act, renderHook } from '@testing-library/react';
import { CallbackInterface, RecoilRoot } from 'recoil';

import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

import { useSelectedTableCellEditMode } from '../useSelectedTableCellEditMode';

const scopeId = 'yourScopeId';

const mockCallbackInterface = {
  set: jest.fn(),
  snapshot: {
    getLoadable: () => ({
      getValue: () => ({ recordId: 'initialRecordId', column: 0 }),
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
      recordId: 'newRecordId',
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
        tableCellPosition.recordId,
        tableCellPosition.column,
      );
    });

    expect(mockCallbackInterface.set).toHaveBeenCalledWith(
      {
        key: 'isTableCellInEditModeComponentFamilyState__{"familyKey":{"column":0,"recordId":"initialRecordId"},"instanceId":"yourScopeId"}',
      },
      false,
    );

    expect(mockCallbackInterface.set).toHaveBeenCalledWith(
      {
        key: 'isTableCellInEditModeComponentFamilyState__{"familyKey":{"column":5,"recordId":"newRecordId"},"instanceId":"yourScopeId"}',
      },
      true,
    );
  });
});
