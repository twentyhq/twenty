import { useSetRecoilState } from 'recoil';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { useSetRecordBoardColumns } from '@/object-record/record-board/hooks/internal/useSetRecordBoardColumns';
import { useSetRecordBoardRecordIds } from '@/object-record/record-board/hooks/internal/useSetRecordBoardRecordIds';
import { useSetRecordIdsForColumn } from '@/object-record/record-board/hooks/internal/useSetRecordIdsForColumn';

export const useRecordBoard = (recordBoardId?: string) => {
  const {
    scopeId,
    fieldDefinitionsState,
    objectSingularNameState,
    selectedRecordIdsSelector,
    isCompactModeActiveState,
    kanbanFieldMetadataNameState,
    shouldFetchMoreSelector,
    isFetchingRecordsByColumnState,
  } = useRecordBoardStates(recordBoardId);

  const { setColumns } = useSetRecordBoardColumns(recordBoardId);
  const { setRecordIds } = useSetRecordBoardRecordIds(recordBoardId);
  const { setRecordIdsForColumn } = useSetRecordIdsForColumn(recordBoardId);

  const setFieldDefinitions = useSetRecoilState(fieldDefinitionsState);
  const setObjectSingularName = useSetRecoilState(objectSingularNameState);
  const setKanbanFieldMetadataName = useSetRecoilState(
    kanbanFieldMetadataNameState,
  );

  return {
    scopeId,
    setColumns,
    setRecordIds,
    setFieldDefinitions,
    setObjectSingularName,
    setKanbanFieldMetadataName,
    selectedRecordIdsSelector,
    isCompactModeActiveState,
    shouldFetchMoreSelector,
    setRecordIdsForColumn,
    isFetchingRecordsByColumnState,
  };
};
