import { DragDropProvider } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { useMemo, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { v4 } from 'uuid';

import { DRAGGABLE_LIST_END_DROP_INDEX } from '@/ui/layout/draggable-list/constants/DraggableListEndDropIndex';
import { DraggableListGroupContext } from '@/ui/layout/draggable-list/contexts/DraggableListGroupContext';
import { type DraggableListDropResult } from '@/ui/layout/draggable-list/types/DraggableListDropResult';
import { DragDropItemEndDropZone } from '@/ui/utilities/drag-and-drop/components/DragDropItemEndDropZone';
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

// Catches drops after the last item; the negative margin cancels its
// footprint so the list keeps its height.
const StyledEndDropZone = styled(DragDropItemEndDropZone)`
  height: ${themeCssVariables.spacing[2]};
  margin-bottom: calc(-1 * ${themeCssVariables.spacing[2]});
`;

export const DraggableList = ({
  draggableItems,
  onDragEnd,
}: DraggableListProps) => {
  // The group id doubles as the items' dnd type, so drags from this list can't
  // land on outer providers' targets (or the other way around).
  const [group] = useState(() => v4());

  const itemIndexByDraggableIdRef = useRef(new Map<string, number>());

  const groupContextValue = useMemo(
    () => ({ group, itemIndexByDraggableIdRef }),
    [group],
  );

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

    const dropTargetIndex =
      targetData.index === DRAGGABLE_LIST_END_DROP_INDEX
        ? itemIndexByDraggableIdRef.current.size
        : targetData.index;

    // The drop line renders before the hovered item, so a drop inserts the
    // dragged item before it; convert that gap index into the final index.
    const destinationIndex = getDestinationIndex({
      dropTargetIndex,
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
      <DraggableListGroupContext.Provider value={groupContextValue}>
        <StyledDragDropItemsWrapper>
          {draggableItems}
          <StyledEndDropZone
            id={`${group}-end-drop-zone`}
            accept={group}
            data={{
              droppableId: group,
              index: DRAGGABLE_LIST_END_DROP_INDEX,
            }}
          />
        </StyledDragDropItemsWrapper>
      </DraggableListGroupContext.Provider>
    </DragDropProvider>
  );
};
