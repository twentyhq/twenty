import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { FIELDS_CONFIGURATION_GROUPS_DROPPABLE_ID } from '@/page-layout/widgets/fields/constants/FieldsConfigurationGroupsDroppableId';
import { useMoveFieldInDraft } from '@/page-layout/widgets/fields/hooks/useMoveFieldInDraft';
import { useReorderFieldsWidgetEditorGroups } from '@/page-layout/widgets/fields/hooks/useReorderFieldsWidgetEditorGroups';
import { type FieldsConfigurationDndData } from '@/page-layout/widgets/fields/types/FieldsConfigurationDndData';
import { type FieldsConfigurationFieldDragData } from '@/page-layout/widgets/fields/types/FieldsConfigurationFieldDragData';
import { type FieldsConfigurationGroupDragData } from '@/page-layout/widgets/fields/types/FieldsConfigurationGroupDragData';
import { type DragDropProviderDragEndEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragEndEvent';
import { type DragDropProviderDragStartEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragStartEvent';
import { getDestinationIndex } from '@/ui/utilities/drag-and-drop/utils/getDestinationIndex';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type DragStartEvent =
  DragDropProviderDragStartEvent<FieldsConfigurationDndData>;
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

  const { reorderGroups } = useReorderFieldsWidgetEditorGroups({
    pageLayoutId,
    widgetId,
  });

  const { moveField } = useMoveFieldInDraft({
    pageLayoutId,
    widgetId,
  });

  const [draggingGroupId, setDraggingGroupId] = useState<string | null>(null);

  const handleGroupDrop = ({
    sourceData,
    targetData,
  }: {
    sourceData: FieldsConfigurationGroupDragData;
    targetData: FieldsConfigurationDndData;
  }) => {
    const sortedGroups = [...draftGroups].sort(
      (a, b) => a.position - b.position,
    );

    // The drop line renders before the hovered group, so group targets insert
    // the dragged group before them; the end drop zone appends it.
    const dropTargetIndex =
      targetData.type === 'group'
        ? targetData.index
        : targetData.type === 'group-list-end'
          ? sortedGroups.length
          : null;

    if (!isDefined(dropTargetIndex)) {
      return;
    }

    const destinationIndex = getDestinationIndex({
      dropTargetIndex,
      sourceIndex: sourceData.index,
      sourceDroppableId: FIELDS_CONFIGURATION_GROUPS_DROPPABLE_ID,
      destinationDroppableId: FIELDS_CONFIGURATION_GROUPS_DROPPABLE_ID,
    });

    if (destinationIndex === sourceData.index) {
      return;
    }

    const reorderedGroupIds = sortedGroups.map((group) => group.id);
    const [movedGroupId] = reorderedGroupIds.splice(sourceData.index, 1);
    reorderedGroupIds.splice(destinationIndex, 0, movedGroupId);

    reorderGroups(reorderedGroupIds);
  };

  const handleFieldDrop = ({
    sourceData,
    targetData,
  }: {
    sourceData: FieldsConfigurationFieldDragData;
    targetData: FieldsConfigurationDndData;
  }) => {
    if (targetData.type !== 'field' && targetData.type !== 'field-list-end') {
      return;
    }

    const destinationGroup = draftGroups.find(
      (group) => group.id === targetData.groupId,
    );

    if (!isDefined(destinationGroup)) {
      return;
    }

    // The drop line renders before the hovered field, so field targets insert
    // the dragged field before them; the end drop zone appends it to the group.
    const dropTargetIndex =
      targetData.type === 'field'
        ? targetData.index
        : destinationGroup.fields.length;

    const destinationIndex = getDestinationIndex({
      dropTargetIndex,
      sourceIndex: sourceData.index,
      sourceDroppableId: sourceData.groupId,
      destinationDroppableId: targetData.groupId,
    });

    if (
      targetData.groupId === sourceData.groupId &&
      destinationIndex === sourceData.index
    ) {
      return;
    }

    moveField(
      sourceData.groupId,
      targetData.groupId,
      sourceData.index,
      destinationIndex,
    );
  };

  const onDragStart = (event: DragStartEvent) => {
    const sourceData = event.operation.source?.data as
      | FieldsConfigurationDndData
      | undefined;

    if (sourceData?.type === 'group') {
      setDraggingGroupId(sourceData.groupId);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setDraggingGroupId(null);

    const sourceData = event.operation.source?.data as
      | FieldsConfigurationDndData
      | undefined;
    const targetData = event.operation.target?.data as
      | FieldsConfigurationDndData
      | undefined;

    if (event.canceled || !isDefined(sourceData) || !isDefined(targetData)) {
      return;
    }

    if (sourceData.type === 'group') {
      handleGroupDrop({ sourceData, targetData });
    } else if (sourceData.type === 'field') {
      handleFieldDrop({ sourceData, targetData });
    }
  };

  return {
    draggingGroupId,
    handlers: { onDragStart, onDragEnd },
  };
};
