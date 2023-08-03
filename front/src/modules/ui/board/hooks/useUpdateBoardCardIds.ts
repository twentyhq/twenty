import { DropResult } from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { useRecoilCallback } from 'recoil';

import { boardCardIdsByColumnIdFamilyState } from '@/pipeline/states/boardCardIdsByColumnIdFamilyState';
import { boardColumnsState } from '@/pipeline/states/boardColumnsState';

import { BoardColumnDefinition } from '../types/BoardColumnDefinition';

export function useUpdateBoardCardIds() {
  return useRecoilCallback(
    ({ snapshot, set }) =>
      (result: DropResult) => {
        const currentBoardColumns = snapshot
          .getLoadable(boardColumnsState)
          .valueOrThrow();

        const newBoardColumns = [...currentBoardColumns];

        const { destination, source } = result;

        if (!destination) return;

        const sourceColumnIndex = newBoardColumns.findIndex(
          (boardColumn: BoardColumnDefinition) =>
            boardColumn.id === source.droppableId,
        );

        const sourceColumn = newBoardColumns[sourceColumnIndex];

        const destinationColumnIndex = newBoardColumns.findIndex(
          (boardColumn: BoardColumnDefinition) =>
            boardColumn.id === destination.droppableId,
        );

        const destinationColumn = newBoardColumns[destinationColumnIndex];

        if (!destinationColumn || !sourceColumn) return;

        const sourceItems = [
          ...snapshot
            .getLoadable(boardCardIdsByColumnIdFamilyState(sourceColumn.id))
            .valueOrThrow(),
        ];

        const destinationItems = [
          ...snapshot
            .getLoadable(
              boardCardIdsByColumnIdFamilyState(destinationColumn.id),
            )
            .valueOrThrow(),
        ];

        const [removedCardId] = sourceItems.splice(source.index, 1);

        const destinationIndex =
          destination.index === 0 ? -1 : destination.index - 1;

        destinationItems.splice(destinationIndex, 0, removedCardId);

        if (destinationColumn.id !== sourceColumn.id) {
          set(boardCardIdsByColumnIdFamilyState(sourceColumn.id), sourceItems);
        }

        set(
          boardCardIdsByColumnIdFamilyState(destinationColumn.id),
          destinationItems,
        );

        return newBoardColumns;
      },
    [],
  );
}
