import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { DEFAULT_CELL_SCOPE } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { useSelectedTableCellEditMode } from '@/object-record/record-table/record-table-cell/hooks/useSelectedTableCellEditMode';
import { recordTablePendingRecordIdByGroupComponentFamilyState } from '@/object-record/record-table/states/recordTablePendingRecordIdByGroupComponentFamilyState';
import { recordTablePendingRecordIdComponentState } from '@/object-record/record-table/states/recordTablePendingRecordIdComponentState';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

export const useCreateNewTableRecord = (recordTableIdFromProps?: string) => {
  const { recordTableId } = useContext(RecordTableContext);

  const recordTableIdToUse = recordTableIdFromProps ?? recordTableId;

  const { setSelectedTableCellEditMode } = useSelectedTableCellEditMode({
    scopeId: recordTableIdToUse,
  });

  const setHotkeyScope = useSetHotkeyScope();

  const setPendingRecordId = useSetRecoilComponentStateV2(
    recordTablePendingRecordIdComponentState,
    recordTableIdToUse,
  );

  const recordTablePendingRecordIdByGroupFamilyState =
    useRecoilComponentCallbackStateV2(
      recordTablePendingRecordIdByGroupComponentFamilyState,
      recordTableIdToUse,
    );

  const createNewTableRecord = () => {
    setPendingRecordId(v4());
    setSelectedTableCellEditMode(-1, 0);
    setHotkeyScope(DEFAULT_CELL_SCOPE.scope, DEFAULT_CELL_SCOPE.customScopes);
  };

  const createNewTableRecordInGroup = useRecoilCallback(
    ({ set }) =>
      (recordGroupId: string) => {
        set(recordTablePendingRecordIdByGroupFamilyState(recordGroupId), v4());
        setSelectedTableCellEditMode(-1, 0);
        setHotkeyScope(
          DEFAULT_CELL_SCOPE.scope,
          DEFAULT_CELL_SCOPE.customScopes,
        );
      },
    [
      recordTablePendingRecordIdByGroupFamilyState,
      setHotkeyScope,
      setSelectedTableCellEditMode,
    ],
  );

  return {
    createNewTableRecord,
    createNewTableRecordInGroup,
  };
};
