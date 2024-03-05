// Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { useRecoilCallback } from 'recoil';

import { useRecordBoardDeprecatedScopedStates } from '@/object-record/record-board-deprecated/hooks/internal/useRecordBoardDeprecatedScopedStates';

import { recordBoardCardIdsByColumnIdFamilyState } from '../../states/recordBoardCardIdsByColumnIdFamilyState';

export const useRemoveRecordBoardDeprecatedCardIdsInternal = () => {
  const { boardColumnsState } = useRecordBoardDeprecatedScopedStates();

  return useRecoilCallback(
    ({ snapshot, set }) =>
      (cardIdToRemove: string[]) => {
        const boardColumns = snapshot.getLoadable(boardColumnsState).getValue();

        boardColumns.forEach((boardColumn) => {
          const columnCardIds = snapshot
            .getLoadable(
              recordBoardCardIdsByColumnIdFamilyState(boardColumn.id),
            )
            .getValue();
          set(
            recordBoardCardIdsByColumnIdFamilyState(boardColumn.id),
            columnCardIds.filter((cardId) => !cardIdToRemove.includes(cardId)),
          );
        });
      },
    [boardColumnsState],
  );
};
