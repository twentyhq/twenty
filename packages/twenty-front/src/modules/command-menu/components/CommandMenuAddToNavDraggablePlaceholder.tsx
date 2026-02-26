import { Draggable } from '@hello-pangea/dnd';
import { type ReactNode, useContext } from 'react';

import { WorkspaceDndKitContext } from '@/navigation/contexts/WorkspaceDndKitContext';

type CommandMenuAddToNavDraggablePlaceholderProps = {
  index: number;
  children: ReactNode;
};

export const CommandMenuAddToNavDraggablePlaceholder = ({
  index,
  children,
}: CommandMenuAddToNavDraggablePlaceholderProps) => {
  const isDndKit = useContext(WorkspaceDndKitContext);

  if (isDndKit) {
    return <>{children}</>;
  }

  return (
    <Draggable
      draggableId={`add-to-nav-placeholder-${index}`}
      index={index}
      isDragDisabled={true}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...provided.draggableProps}
        >
          {children}
        </div>
      )}
    </Draggable>
  );
};
