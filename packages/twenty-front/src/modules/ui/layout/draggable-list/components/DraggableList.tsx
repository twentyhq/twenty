import { DragDropProvider } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { DraggableListGroupContext } from '@/ui/layout/draggable-list/contexts/DraggableListGroupContext';
import { type DraggableListDropResult } from '@/ui/layout/draggable-list/types/DraggableListDropResult';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { type DragDropProviderDragEndEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragEndEvent';
import { getDestinationIndex } from '@/ui/utilities/drag-and-drop/utils/getDestinationIndex';

type DraggableListItemDndData = {
  droppableId: string;
  index: number;
};

type DraggableListProps = {
  draggableItems: React.ReactNode;
  onDragEnd: (result: DraggableListDropResult) => void;
};

const StyledDragDropItemsWrapper = styled.div`
  width: 100%;
`;

export const DraggableList = ({
  draggableItems,
  onDragEnd,
}: DraggableListProps) => {
  // The group id doubles as the items' dnd type, so drags from this list can't
  // land on outer providers' targets (or the other way around).
  const [group] = useState(() => v4());

  const handleDragEnd = (
    event: DragDropProviderDragEndEvent<DraggableListItemDndData>,
  ) => {
    const source = event.operation.source;
    const sourceData = source?.data as DraggableListItemDndData | undefined;
    const targetData = event.operation.target?.data as
      | DraggableListItemDndData
      | undefined;

    if (
      event.canceled ||
      !isDefined(source) ||
      sourceData?.droppableId !== group ||
      targetData?.droppableId !== group
    ) {
      return;
    }

    // The drop line renders before the hovered item, so a drop inserts the
    // dragged item before it; convert that gap index into the final index.
    const destinationIndex = getDestinationIndex({
      dropTargetIndex: targetData.index,
      sourceIndex: sourceData.index,
      sourceDroppableId: sourceData.droppableId,
      destinationDroppableId: targetData.droppableId,
    });

    if (destinationIndex === sourceData.index) {
      return;
    }

    onDragEnd({
      draggableId: String(source.id),
      source: { index: sourceData.index },
      destination: { index: destinationIndex },
    });
  };

  return (
    <DragDropProvider<DraggableListItemDndData>
      sensors={DND_KIT_SENSORS}
      onDragEnd={handleDragEnd}
    >
      <DraggableListGroupContext.Provider value={group}>
        <StyledDragDropItemsWrapper>{draggableItems}</StyledDragDropItemsWrapper>
      </DraggableListGroupContext.Provider>
    </DragDropProvider>
  );
};
