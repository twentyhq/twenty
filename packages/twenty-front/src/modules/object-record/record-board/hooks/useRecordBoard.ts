import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { useSetRecordBoardColumns } from '@/object-record/record-board/hooks/internal/useSetRecordBoardColumns';

export const useRecordBoard = (recordBoardId?: string) => {
  const { scopeId, getColumnIdsState, columnsFamilySelector } =
    useRecordBoardStates(recordBoardId);

  const { setRecordBoardColumns } = useSetRecordBoardColumns(recordBoardId);

  return {
    scopeId,
    getColumnIdsState,
    columnsFamilySelector,
    setRecordBoardColumns,
  };
};
