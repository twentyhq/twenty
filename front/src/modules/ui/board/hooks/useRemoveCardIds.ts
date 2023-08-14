// Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { useRecoilCallback } from 'recoil';

import { boardCardIdsByColumnIdFamilyState } from '../states/boardCardIdsByColumnIdFamilyState';
import { boardColumnsState } from '../states/boardColumnsState';

export function useRemoveCardIds() {
  return useRecoilCallback(
    ({ snapshot, set }) =>
      (cardIdToRemove: string[]) => {
        const boardColumns = snapshot
          .getLoadable(boardColumnsState)
          .valueOrThrow();

        boardColumns.forEach((boardColumn) => {
          const columnCardIds = snapshot
            .getLoadable(boardCardIdsByColumnIdFamilyState(boardColumn.id))
            .valueOrThrow();
          set(
            boardCardIdsByColumnIdFamilyState(boardColumn.id),
            columnCardIds.filter((cardId) => !cardIdToRemove.includes(cardId)),
          );
        });
      },
    [],
  );
}
