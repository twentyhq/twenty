import type { Context } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useSetRecoilState } from 'recoil';

import { contextMenuIsOpenState } from '@/ui/context-menu/states/contextMenuIsOpenState';
import { contextMenuPositionState } from '@/ui/context-menu/states/contextMenuPositionState';

import { useCurrentCardSelected } from '../hooks/useCurrentCardSelected';
import { BoardOptions } from '../types/BoardOptions';

export const EntityBoardCard = ({
  boardOptions,
  cardId,
  index,
  scopeContext,
}: {
  boardOptions: BoardOptions;
  cardId: string;
  index: number;
  scopeContext: Context<string | null>;
}) => {
  const setContextMenuPosition = useSetRecoilState(contextMenuPositionState);
  const setContextMenuOpenState = useSetRecoilState(contextMenuIsOpenState);

  const { setCurrentCardSelected } = useCurrentCardSelected();

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setCurrentCardSelected(true);
    setContextMenuPosition({
      x: event.clientX,
      y: event.clientY,
    });
    setContextMenuOpenState(true);
  };

  return (
    <Draggable key={cardId} draggableId={cardId} index={index}>
      {(draggableProvided) => (
        <div
          ref={draggableProvided?.innerRef}
          {...draggableProvided?.dragHandleProps}
          {...draggableProvided?.draggableProps}
          className="entity-board-card"
          data-selectable-id={cardId}
          data-select-disable
          onContextMenu={handleContextMenu}
        >
          {<boardOptions.CardComponent scopeContext={scopeContext} />}
        </div>
      )}
    </Draggable>
  );
};
