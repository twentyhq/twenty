import { useSetRecoilState } from 'recoil';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { useSetRecordBoardColumns } from '@/object-record/record-board/hooks/internal/useSetRecordBoardColumns';
import { useSetRecordBoardRecordIds } from '@/object-record/record-board/hooks/internal/useSetRecordBoardRecordIds';

export const useRecordBoard = (recordBoardId?: string) => {
  const {
    scopeId,
    getFieldDefinitionsState,
    getObjectSingularNameState,
    getSelectedRecordIdsSelector,
    getIsCompactModeActiveState,
    getOnFetchMoreVisibilityChangeState,
  } = useRecordBoardStates(recordBoardId);

  const { setColumns } = useSetRecordBoardColumns(recordBoardId);
  const { setRecordIds } = useSetRecordBoardRecordIds(recordBoardId);
  const setFieldDefinitions = useSetRecoilState(getFieldDefinitionsState());
  const setObjectSingularName = useSetRecoilState(getObjectSingularNameState());

  return {
    scopeId,
    setColumns,
    setRecordIds,
    setFieldDefinitions,
    setObjectSingularName,
    getSelectedRecordIdsSelector,
    getIsCompactModeActiveState,
    getOnFetchMoreVisibilityChangeState,
  };
};
