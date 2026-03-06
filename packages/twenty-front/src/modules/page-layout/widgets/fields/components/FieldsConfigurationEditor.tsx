import { styled } from '@linaria/react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { FieldsConfigurationGroupEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationGroupEditor';
import { FieldsConfigurationUngroupedEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationUngroupedEditor';
import { useCreateFieldsWidgetEditorGroup } from '@/page-layout/widgets/fields/hooks/useCreateFieldsWidgetEditorGroup';
import { useDeleteFieldsWidgetEditorGroup } from '@/page-layout/widgets/fields/hooks/useDeleteFieldsWidgetEditorGroup';
import { useFieldsWidgetEditorMode } from '@/page-layout/widgets/fields/hooks/useFieldsWidgetEditorMode';
import { useMoveFieldInDraft } from '@/page-layout/widgets/fields/hooks/useMoveFieldInDraft';
import { useMoveUngroupedFieldInDraft } from '@/page-layout/widgets/fields/hooks/useMoveUngroupedFieldInDraft';
import { useReorderFieldsWidgetEditorGroups } from '@/page-layout/widgets/fields/hooks/useReorderFieldsWidgetEditorGroups';
import { useToggleFieldVisibilityInDraft } from '@/page-layout/widgets/fields/hooks/useToggleFieldVisibilityInDraft';
import { useToggleUngroupedFieldVisibilityInDraft } from '@/page-layout/widgets/fields/hooks/useToggleUngroupedFieldVisibilityInDraft';
import { useUpdateFieldsWidgetEditorGroup } from '@/page-layout/widgets/fields/hooks/useUpdateFieldsWidgetEditorGroup';
import { getFieldsConfigurationGroupRenameDropdownId } from '@/page-layout/widgets/fields/utils/getFieldsConfigurationGroupRenameDropdownId';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

const StyledGroupsDroppable = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type FieldsConfigurationEditorProps = {
  pageLayoutId: string;
  widgetId: string;
};

export const FieldsConfigurationEditor = ({
  pageLayoutId,
  widgetId,
}: FieldsConfigurationEditorProps) => {
  const { t } = useLingui();
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { editorMode } = useFieldsWidgetEditorMode({
    pageLayoutId,
    widgetId,
  });

  const fieldsWidgetGroupsDraft = useAtomComponentStateValue(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const draftGroups = fieldsWidgetGroupsDraft[widgetId] ?? [];

  const fieldsWidgetUngroupedFieldsDraft = useAtomComponentStateValue(
    fieldsWidgetUngroupedFieldsDraftComponentState,
    pageLayoutId,
  );

  const ungroupedFields = fieldsWidgetUngroupedFieldsDraft[widgetId] ?? [];

  const { createGroup } = useCreateFieldsWidgetEditorGroup({
    pageLayoutId,
    widgetId,
  });

  const { reorderGroups } = useReorderFieldsWidgetEditorGroups({
    pageLayoutId,
    widgetId,
  });

  const { moveField } = useMoveFieldInDraft({
    pageLayoutId,
    widgetId,
  });

  const { toggleFieldVisibility } = useToggleFieldVisibilityInDraft({
    pageLayoutId,
    widgetId,
  });

  const { moveField: moveUngroupedField } = useMoveUngroupedFieldInDraft({
    pageLayoutId,
    widgetId,
  });

  const { toggleFieldVisibility: toggleUngroupedFieldVisibility } =
    useToggleUngroupedFieldVisibilityInDraft({
      pageLayoutId,
      widgetId,
    });

  const { updateGroup } = useUpdateFieldsWidgetEditorGroup({
    pageLayoutId,
    widgetId,
  });

  const { deleteGroup } = useDeleteFieldsWidgetEditorGroup({
    pageLayoutId,
    widgetId,
  });

  const { openDropdown } = useOpenDropdown();

  const [renamingGroupValue, setRenamingGroupValue] = useState('');

  const handleStartRename = ({ groupName }: { groupName: string }) => {
    setRenamingGroupValue(groupName);
  };

  const handleRenameGroup = ({
    groupId,
    newName,
  }: {
    groupId: string;
    newName: string;
  }) => {
    updateGroup({ groupId, name: newName });
  };

  const handleDeleteGroup = ({ groupId }: { groupId: string }) => {
    deleteGroup(groupId);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (type === 'GROUP') {
      handleGroupReorder(source.index, destination.index);
    } else if (type === 'FIELD') {
      handleFieldMove(
        source.droppableId,
        destination.droppableId,
        source.index,
        destination.index,
      );
    }
  };

  const handleGroupReorder = (
    sourceIndex: number,
    destinationIndex: number,
  ) => {
    const sortedGroups = [...draftGroups].sort(
      (a, b) => a.position - b.position,
    );

    const reorderedGroupIds = sortedGroups.map((g) => g.id);
    const [movedGroupId] = reorderedGroupIds.splice(sourceIndex, 1);
    reorderedGroupIds.splice(destinationIndex, 0, movedGroupId);

    reorderGroups(reorderedGroupIds);
  };

  const handleFieldMove = (
    sourceGroupId: string,
    destinationGroupId: string,
    sourceIndex: number,
    destinationIndex: number,
  ) => {
    const cleanSourceGroupId = sourceGroupId.replace('group-', '');
    const cleanDestinationGroupId = destinationGroupId.replace('group-', '');

    moveField(
      cleanSourceGroupId,
      cleanDestinationGroupId,
      sourceIndex,
      destinationIndex,
    );
  };

  const handleAddGroup = ({ afterGroupId }: { afterGroupId?: string }) => {
    const newGroupName = t`New Group`;
    const newGroupId = createGroup({ name: newGroupName, afterGroupId });

    setRenamingGroupValue(newGroupName);
    openDropdown({
      dropdownComponentInstanceIdFromProps:
        getFieldsConfigurationGroupRenameDropdownId(newGroupId),
    });
  };

  if (editorMode === 'ungrouped') {
    return (
      <FieldsConfigurationUngroupedEditor
        ungroupedFields={ungroupedFields}
        onMoveField={moveUngroupedField}
        onToggleFieldVisibility={toggleUngroupedFieldVisibility}
        onAddGroup={() => handleAddGroup({})}
      />
    );
  }

  const sortedGroups = [...draftGroups].sort((a, b) => a.position - b.position);

  if (sortedGroups.length === 0) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="groups" type="GROUP">
        {(provided) => (
          <StyledGroupsDroppable
            ref={provided.innerRef}
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...provided.droppableProps}
          >
            {sortedGroups.map((group, index) => (
              <Draggable
                key={group.id}
                draggableId={`group-draggable-${group.id}`}
                index={index}
              >
                {(draggableProvided, snapshot) => (
                  <FieldsConfigurationGroupEditor
                    group={group}
                    index={index}
                    objectMetadataItem={objectMetadataItem}
                    draggableProvided={draggableProvided}
                    isDragging={snapshot.isDragging}
                    onAddGroup={() =>
                      handleAddGroup({ afterGroupId: group.id })
                    }
                    onToggleFieldVisibility={(fieldMetadataId) =>
                      toggleFieldVisibility(group.id, fieldMetadataId)
                    }
                    onRenameGroup={handleRenameGroup}
                    onDeleteGroup={handleDeleteGroup}
                    renamingGroupValue={renamingGroupValue}
                    onRenamingGroupValueChange={setRenamingGroupValue}
                    onStartRename={handleStartRename}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </StyledGroupsDroppable>
        )}
      </Droppable>
    </DragDropContext>
  );
};
