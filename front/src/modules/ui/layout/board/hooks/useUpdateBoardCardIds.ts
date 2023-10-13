import { DropResult } from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { useRecoilCallback } from 'recoil';

import { boardCardIdsByColumnIdFamilyState } from '../states/boardCardIdsByColumnIdFamilyState';
import { boardColumnsState } from '../states/boardColumnsState';
import { BoardColumnDefinition } from '../types/BoardColumnDefinition';

export const useUpdateBoardCardIds = () =>
  useRecoilCallback(
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

        const sourceCardIds = [
          ...snapshot
            .getLoadable(boardCardIdsByColumnIdFamilyState(sourceColumn.id))
            .valueOrThrow(),
        ];

        const destinationCardIds = [
          ...snapshot
            .getLoadable(
              boardCardIdsByColumnIdFamilyState(destinationColumn.id),
            )
            .valueOrThrow(),
        ];

        const destinationIndex =
          destination.index >= destinationCardIds.length
            ? destinationCardIds.length - 1
            : destination.index;

        if (sourceColumn.id === destinationColumn.id) {
          const [deletedCardId] = sourceCardIds.splice(source.index, 1);

          sourceCardIds.splice(destinationIndex, 0, deletedCardId);

          set(
            boardCardIdsByColumnIdFamilyState(sourceColumn.id),
            sourceCardIds,
          );
        } else {
          const [removedCardId] = sourceCardIds.splice(source.index, 1);

          destinationCardIds.splice(destinationIndex, 0, removedCardId);

          set(
            boardCardIdsByColumnIdFamilyState(sourceColumn.id),
            sourceCardIds,
          );

          set(
            boardCardIdsByColumnIdFamilyState(destinationColumn.id),
            destinationCardIds,
          );
        }

        return newBoardColumns;
      },
    [],
  );
