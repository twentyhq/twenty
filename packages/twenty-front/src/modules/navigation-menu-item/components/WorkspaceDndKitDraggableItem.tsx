import { useDraggable } from '@dnd-kit/react';
import { type ReactNode } from 'react';

type WorkspaceDndKitDraggableItemProps = {
  id: string;
  sourceDroppableId: string;
  sourceIndex: number;
  disabled?: boolean;
  itemComponent: ReactNode | ((props: { isDragging: boolean }) => ReactNode);
};

export const WorkspaceDndKitDraggableItem = ({
  id,
  sourceDroppableId,
  sourceIndex,
  disabled = false,
  itemComponent,
}: WorkspaceDndKitDraggableItemProps) => {
  const { ref, handleRef, isDragging } = useDraggable({
    id,
    data: {
      sourceDroppableId,
      sourceIndex,
    },
    disabled,
  });

  const content =
    typeof itemComponent === 'function'
      ? itemComponent({ isDragging })
      : itemComponent;

  return (
    <div
      ref={(el) => {
        ref(el);
        handleRef?.(el);
      }}
    >
      {content}
    </div>
  );
};
