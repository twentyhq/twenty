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
}: {
  boardOptions: BoardOptions;
  cardId: string;
  index: number;
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
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...draggableProvided?.dragHandleProps}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...draggableProvided?.draggableProps}
          className="entity-board-card"
          data-selectable-id={cardId}
          data-select-disable
          onContextMenu={handleContextMenu}
        >
          {<boardOptions.CardComponent />}
        </div>
      )}
    </Draggable>
  );
};
