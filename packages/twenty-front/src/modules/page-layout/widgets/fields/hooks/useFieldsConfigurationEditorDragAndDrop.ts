import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { FIELDS_CONFIGURATION_GROUPS_DROPPABLE_ID } from '@/page-layout/widgets/fields/constants/FieldsConfigurationGroupsDroppableId';
import { useMoveFieldInDraft } from '@/page-layout/widgets/fields/hooks/useMoveFieldInDraft';
import { useReorderFieldsWidgetEditorGroups } from '@/page-layout/widgets/fields/hooks/useReorderFieldsWidgetEditorGroups';
import { type FieldsConfigurationDndData } from '@/page-layout/widgets/fields/types/FieldsConfigurationDndData';
import { type DragDropInsertionContextValues } from '@/ui/utilities/drag-and-drop/hooks/useDragDropInsertionIndex';
import { type DragDropProviderDragEndEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragEndEvent';
import { type DragDropProviderDragMoveEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragMoveEvent';
import { type DragDropProviderDragStartEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragStartEvent';
import { getDestinationIndex } from '@/ui/utilities/drag-and-drop/utils/getDestinationIndex';
import { resolveDropFromPointer } from '@/ui/utilities/drag-and-drop/utils/resolveDropFromPointer';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type DragStartEvent = DragDropProviderDragStartEvent<FieldsConfigurationDndData>;
type DragMoveEvent = DragDropProviderDragMoveEvent<FieldsConfigurationDndData>;
type DragEndEvent = DragDropProviderDragEndEvent<FieldsConfigurationDndData>;

type UseFieldsConfigurationEditorDragAndDropParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useFieldsConfigurationEditorDragAndDrop = ({
  pageLayoutId,
  widgetId,
}: UseFieldsConfigurationEditorDragAndDropParams) => {
  const fieldsWidgetGroupsDraft = useAtomComponentStateValue(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const draftGroups = fieldsWidgetGroupsDraft[widgetId] ?? [];

  const sortedGroups = [...draftGroups].sort((a, b) => a.position - b.position);

  const { reorderGroups } = useReorderFieldsWidgetEditorGroups({
    pageLayoutId,
    widgetId,
  });

  const { moveField } = useMoveFieldInDraft({
    pageLayoutId,
    widgetId,
  });

  const [draggingGroupId, setDraggingGroupId] = useState<string | null>(null);
  const [activeDropTargetIndex, setActiveDropTargetIndex] = useState<
    number | null
  >(null);
  const [activeDroppableId, setActiveDroppableId] = useState<string | null>(
    null,
  );

  const getDroppableItemCount = (droppableId: string) => {
    if (droppableId === FIELDS_CONFIGURATION_GROUPS_DROPPABLE_ID) {
      return sortedGroups.length;
    }

    const group = draftGroups.find((candidate) => candidate.id === droppableId);

    return group?.fields.length ?? 0;
  };

  const clearActiveDropTarget = () => {
    setActiveDropTargetIndex(null);
    setActiveDroppableId(null);
  };

  const handleGroupDrop = ({
    sourceIndex,
    dropTargetIndex,
  }: {
    sourceIndex: number;
    dropTargetIndex: number;
  }) => {
    const destinationIndex = getDestinationIndex({
      dropTargetIndex,
      sourceIndex,
      sourceDroppableId: FIELDS_CONFIGURATION_GROUPS_DROPPABLE_ID,
      destinationDroppableId: FIELDS_CONFIGURATION_GROUPS_DROPPABLE_ID,
    });

    if (destinationIndex === sourceIndex) {
      return;
    }

    const reorderedGroupIds = sortedGroups.map((group) => group.id);
    const [movedGroupId] = reorderedGroupIds.splice(sourceIndex, 1);
    reorderedGroupIds.splice(destinationIndex, 0, movedGroupId);

    reorderGroups(reorderedGroupIds);
  };

  const handleFieldDrop = ({
    sourceData,
    destinationGroupId,
    dropTargetIndex,
  }: {
    sourceData: FieldsConfigurationDndData & { type: 'field' };
    destinationGroupId: string;
    dropTargetIndex: number;
  }) => {
    const destinationGroup = draftGroups.find(
      (group) => group.id === destinationGroupId,
    );

    if (!isDefined(destinationGroup)) {
      return;
    }

    const destinationIndex = getDestinationIndex({
      dropTargetIndex,
      sourceIndex: sourceData.index,
      sourceDroppableId: sourceData.groupId,
      destinationDroppableId: destinationGroupId,
    });

    if (
      destinationGroupId === sourceData.groupId &&
      destinationIndex === sourceData.index
    ) {
      return;
    }

    moveField(
      sourceData.groupId,
      destinationGroupId,
      sourceData.index,
      destinationIndex,
    );
  };

  const onDragStart = (event: DragStartEvent) => {
    clearActiveDropTarget();

    const sourceData = event.operation.source?.data as
      | FieldsConfigurationDndData
      | undefined;

    if (sourceData?.type === 'group') {
      setDraggingGroupId(sourceData.groupId);
    }
  };

  const onDragMove = (event: DragMoveEvent) => {
    const resolvedDrop = resolveDropFromPointer({
      target: event.operation.target,
      pointer: event.operation.position.current,
      defaultOrientation: 'horizontal',
      getDroppableItemCount,
    });

    setActiveDropTargetIndex(resolvedDrop?.dropTargetIndex ?? null);
    setActiveDroppableId(resolvedDrop?.droppableId ?? null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    setDraggingGroupId(null);
    clearActiveDropTarget();

    const sourceData = event.operation.source?.data as
      | FieldsConfigurationDndData
      | undefined;

    if (event.canceled || !isDefined(sourceData)) {
      return;
    }

    const resolvedDrop = resolveDropFromPointer({
      target: event.operation.target,
      pointer: event.operation.position.current,
      defaultOrientation: 'horizontal',
      getDroppableItemCount,
    });

    if (!isDefined(resolvedDrop)) {
      return;
    }

    if (
      sourceData.type === 'group' &&
      resolvedDrop.droppableId === FIELDS_CONFIGURATION_GROUPS_DROPPABLE_ID
    ) {
      handleGroupDrop({
        sourceIndex: sourceData.index,
        dropTargetIndex: resolvedDrop.dropTargetIndex,
      });
    } else if (sourceData.type === 'field') {
      handleFieldDrop({
        sourceData,
        destinationGroupId: resolvedDrop.droppableId,
        dropTargetIndex: resolvedDrop.dropTargetIndex,
      });
    }
  };

  const contextValues: DragDropInsertionContextValues = {
    activeDropTargetIndex,
    activeDroppableId,
  };

  return {
    draggingGroupId,
    contextValues,
    handlers: { onDragStart, onDragMove, onDragEnd },
  };
};
