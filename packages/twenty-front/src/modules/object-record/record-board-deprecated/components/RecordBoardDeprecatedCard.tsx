import { Draggable } from '@hello-pangea/dnd';
import { useSetRecoilState } from 'recoil';

import { contextMenuIsOpenState } from '@/ui/navigation/context-menu/states/contextMenuIsOpenState';
import { contextMenuPositionState } from '@/ui/navigation/context-menu/states/contextMenuPositionState';

import { useCurrentRecordBoardDeprecatedCardSelectedInternal } from '../hooks/internal/useCurrentRecordBoardDeprecatedCardSelectedInternal';
import { BoardOptions } from '../types/BoardOptions';

export const RecordBoardDeprecatedCard = ({
  recordBoardOptions,
  cardId,
  index,
}: {
  recordBoardOptions: BoardOptions;
  cardId: string;
  index: number;
}) => {
  const setContextMenuPosition = useSetRecoilState(contextMenuPositionState);
  const setContextMenuOpenState = useSetRecoilState(contextMenuIsOpenState);

  const { setCurrentCardSelected } =
    useCurrentRecordBoardDeprecatedCardSelectedInternal();

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
          {<recordBoardOptions.CardComponent />}
        </div>
      )}
    </Draggable>
  );
};
