import { DragDropProvider } from '@dnd-kit/react';
import { styled } from '@linaria/react';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { FieldsConfigurationGroupEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationGroupEditor';
import { FieldsConfigurationUngroupedEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationUngroupedEditor';
import { FIELDS_CONFIGURATION_GROUP_DND_TYPE } from '@/page-layout/widgets/fields/constants/FieldsConfigurationGroupDndType';
import { FIELDS_CONFIGURATION_GROUPS_DROPPABLE_ID } from '@/page-layout/widgets/fields/constants/FieldsConfigurationGroupsDroppableId';
import { useCreateFieldsWidgetEditorGroup } from '@/page-layout/widgets/fields/hooks/useCreateFieldsWidgetEditorGroup';
import { useDeleteFieldsWidgetEditorGroup } from '@/page-layout/widgets/fields/hooks/useDeleteFieldsWidgetEditorGroup';
import { useFieldsConfigurationEditorDragAndDrop } from '@/page-layout/widgets/fields/hooks/useFieldsConfigurationEditorDragAndDrop';
import { useFieldsWidgetEditorMode } from '@/page-layout/widgets/fields/hooks/useFieldsWidgetEditorMode';
import { useMoveUngroupedFieldInDraft } from '@/page-layout/widgets/fields/hooks/useMoveUngroupedFieldInDraft';
import { useToggleFieldVisibilityInDraft } from '@/page-layout/widgets/fields/hooks/useToggleFieldVisibilityInDraft';
import { useToggleUngroupedFieldVisibilityInDraft } from '@/page-layout/widgets/fields/hooks/useToggleUngroupedFieldVisibilityInDraft';
import { useUpdateFieldsWidgetEditorGroup } from '@/page-layout/widgets/fields/hooks/useUpdateFieldsWidgetEditorGroup';
import { type FieldsConfigurationDndData } from '@/page-layout/widgets/fields/types/FieldsConfigurationDndData';
import { type FieldsConfigurationGroupDragData } from '@/page-layout/widgets/fields/types/FieldsConfigurationGroupDragData';
import { type FieldsConfigurationGroupListEndDropData } from '@/page-layout/widgets/fields/types/FieldsConfigurationGroupListEndDropData';
import { getFieldsConfigurationGroupRenameDropdownId } from '@/page-layout/widgets/fields/utils/getFieldsConfigurationGroupRenameDropdownId';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { DragDropItemEndDropZone } from '@/ui/utilities/drag-and-drop/components/DragDropItemEndDropZone';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';
import { DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION } from '@/ui/utilities/drag-and-drop/constants/DndKitProviderPluginsWithoutDropAnimation';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconNewSection } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';

const StyledGroupsDroppable = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledAddGroupButtonContainer = styled.div`
  border: 1px solid transparent;
`;

const GROUPS_END_DROP_DATA: FieldsConfigurationGroupListEndDropData = {
  type: 'group-list-end',
};

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

  const { draggingGroupId, handlers } = useFieldsConfigurationEditorDragAndDrop(
    {
      pageLayoutId,
      widgetId,
    },
  );

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
    <DragDropProvider<FieldsConfigurationDndData>
      sensors={DND_KIT_SENSORS}
      plugins={DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION}
      onDragStart={handlers.onDragStart}
      onDragEnd={handlers.onDragEnd}
    >
      <StyledGroupsDroppable>
        {sortedGroups.map((group, index) => {
          const groupDragData: FieldsConfigurationGroupDragData = {
            type: 'group',
            groupId: group.id,
            index,
          };

          return (
            <DragDropItemSortableCell
              key={group.id}
              id={group.id}
              index={index}
              group={FIELDS_CONFIGURATION_GROUPS_DROPPABLE_ID}
              data={groupDragData}
              type={FIELDS_CONFIGURATION_GROUP_DND_TYPE}
              accept={FIELDS_CONFIGURATION_GROUP_DND_TYPE}
              hasTransition={false}
              dropLine="horizontal"
            >
              <FieldsConfigurationGroupEditor
                group={group}
                objectMetadataItem={objectMetadataItem}
                isDragging={draggingGroupId === group.id}
                onAddGroup={() => handleAddGroup({ afterGroupId: group.id })}
                onToggleFieldVisibility={(fieldMetadataId) =>
                  toggleFieldVisibility(group.id, fieldMetadataId)
                }
                onRenameGroup={handleRenameGroup}
                onDeleteGroup={handleDeleteGroup}
                renamingGroupValue={renamingGroupValue}
                onRenamingGroupValueChange={setRenamingGroupValue}
                onStartRename={handleStartRename}
              />
            </DragDropItemSortableCell>
          );
        })}

        <DragDropItemEndDropZone
          id={`${FIELDS_CONFIGURATION_GROUPS_DROPPABLE_ID}-end`}
          accept={FIELDS_CONFIGURATION_GROUP_DND_TYPE}
          data={GROUPS_END_DROP_DATA}
        >
          <StyledAddGroupButtonContainer>
            <MenuItem
              LeftIcon={IconNewSection}
              text={t`Add a Group`}
              onClick={() => handleAddGroup({})}
              withIconContainer
              withIconContainerBackground={false}
            />
          </StyledAddGroupButtonContainer>
        </DragDropItemEndDropZone>
      </StyledGroupsDroppable>
    </DragDropProvider>
  );
};
