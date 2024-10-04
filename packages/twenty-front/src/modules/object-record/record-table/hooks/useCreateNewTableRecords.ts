import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { DEFAULT_CELL_SCOPE } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { useSelectedTableCellEditMode } from '@/object-record/record-table/record-table-cell/hooks/useSelectedTableCellEditMode';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useContext } from 'react';
import { v4 } from 'uuid';

export const useCreateNewTableRecord = (recordTableIdFromProps?: string) => {
  const { recordTableId } = useContext(RecordTableContext);

  const recordTableIdToUse = recordTableIdFromProps ?? recordTableId;

  const { setSelectedTableCellEditMode } = useSelectedTableCellEditMode({
    scopeId: recordTableIdToUse,
  });

  const setHotkeyScope = useSetHotkeyScope();

  const { setPendingRecordId } = useRecordTable({
    recordTableId: recordTableIdToUse,
  });

  const createNewTableRecord = () => {
    setPendingRecordId(v4());
    setSelectedTableCellEditMode(-1, 0);
    setHotkeyScope(DEFAULT_CELL_SCOPE.scope, DEFAULT_CELL_SCOPE.customScopes);
  };

  return {
    createNewTableRecord,
  };
};
