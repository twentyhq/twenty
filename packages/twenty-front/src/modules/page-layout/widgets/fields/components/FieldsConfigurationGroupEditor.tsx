import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { FieldsConfigurationFieldEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationFieldEditor';
import { FieldsConfigurationGroupDropdown } from '@/page-layout/widgets/fields/components/FieldsConfigurationGroupDropdown';
import { FieldsConfigurationGroupRenameInput } from '@/page-layout/widgets/fields/components/FieldsConfigurationGroupRenameInput';
import { FIELDS_CONFIGURATION_FIELD_DND_TYPE } from '@/page-layout/widgets/fields/constants/FieldsConfigurationFieldDndType';
import {
  type FieldsConfigurationFieldDragData,
  type FieldsConfigurationFieldListEndDropData,
} from '@/page-layout/widgets/fields/types/FieldsConfigurationDndData';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { getFieldsConfigurationGroupRenameDropdownId } from '@/page-layout/widgets/fields/utils/getFieldsConfigurationGroupRenameDropdownId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { DragDropItemDropLine } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropLine';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';
import { DragDropItemSortableHandle } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableHandle';

import { FieldsConfigurationGroupDraggableHeader } from '@/page-layout/widgets/fields/components/FieldsConfigurationGroupDraggableHeader';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFieldsDroppable = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledEmptyGroupDropZone = styled.div`
  align-items: center;
  border: 1px dashed ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  justify-content: center;
  margin: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[10]};
  position: relative;
`;

const StyledFieldsEndDropZone = styled.div`
  min-height: ${themeCssVariables.spacing[2]};
  position: relative;
`;

const StyledGroupContainer = styled.div<{ isDragging: boolean }>`
  background: ${({ isDragging }) =>
    isDragging ? themeCssVariables.background.primary : 'transparent'};
  border: 1px solid
    ${({ isDragging }) =>
      isDragging ? themeCssVariables.color.blue : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledGroupHeaderRow = styled.div`
  align-items: center;
  display: flex;
  position: relative;
  width: 100%;
`;

const StyledMenuItemDraggableWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledDropdownContainer = styled.div`
  position: absolute;
  right: ${themeCssVariables.spacing[1]};
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
`;

type FieldsConfigurationGroupEditorProps = {
  group: FieldsWidgetGroup;
  objectMetadataItem: EnrichedObjectMetadataItem;
  isDragging: boolean;
  onAddGroup?: () => void;
  onToggleFieldVisibility: (fieldMetadataId: string) => void;
  onRenameGroup: (params: { groupId: string; newName: string }) => void;
  onDeleteGroup: (params: { groupId: string }) => void;
  renamingGroupValue: string;
  onRenamingGroupValueChange: (value: string) => void;
  onStartRename: (params: { groupId: string; groupName: string }) => void;
};

export const FieldsConfigurationGroupEditor = ({
  group,
  isDragging,
  onAddGroup,
  onToggleFieldVisibility,
  onRenameGroup,
  onDeleteGroup,
  renamingGroupValue,
  onRenamingGroupValueChange,
  onStartRename,
}: FieldsConfigurationGroupEditorProps) => {
  const { t } = useLingui();

  const renameDropdownId = getFieldsConfigurationGroupRenameDropdownId(
    group.id,
  );

  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();

  const handleStartRename = () => {
    onStartRename({ groupId: group.id, groupName: group.name });
    openDropdown({
      dropdownComponentInstanceIdFromProps: renameDropdownId,
    });
  };

  const handleCancelRename = () => {
    closeDropdown(renameDropdownId);
  };

  const handleRenameGroup = ({
    groupId,
    newName,
  }: {
    groupId: string;
    newName: string;
  }) => {
    closeDropdown(renameDropdownId);
    onRenameGroup({ groupId, newName });
  };

  const fieldsEndDropData: FieldsConfigurationFieldListEndDropData = {
    type: 'field-list-end',
    groupId: group.id,
  };

  // Catches drops below the group's last field and drops into an empty group.
  const { ref: fieldsEndDropRef, isDropTarget: isFieldsEndDropTarget } =
    useDroppable({
      id: `fields-configuration-group-${group.id}-end`,
      accept: FIELDS_CONFIGURATION_FIELD_DND_TYPE,
      collisionDetector: pointerIntersection,
      data: fieldsEndDropData,
    });

  const sortedFields = [...group.fields].sort(
    (a, b) => a.position - b.position,
  );

  return (
    <StyledGroupContainer isDragging={isDragging}>
      <StyledGroupHeaderRow>
        <DragDropItemSortableHandle fill>
          <Dropdown
            dropdownId={renameDropdownId}
            clickableComponentWidth="100%"
            clickableComponent={
              <StyledMenuItemDraggableWrapper>
                <FieldsConfigurationGroupDraggableHeader text={group.name} />
              </StyledMenuItemDraggableWrapper>
            }
            disableClickForClickableComponent
            dropdownPlacement="bottom-start"
            dropdownOffset={{ x: 32 }}
            onClose={handleCancelRename}
            dropdownComponents={
              <DropdownContent
                widthInPixels={GenericDropdownContentWidth.Large}
              >
                <FieldsConfigurationGroupRenameInput
                  dropdownId={renameDropdownId}
                  renameValue={renamingGroupValue}
                  onRenameValueChange={onRenamingGroupValueChange}
                  onSave={(newName) =>
                    handleRenameGroup({ groupId: group.id, newName })
                  }
                  onCancel={handleCancelRename}
                />
              </DropdownContent>
            }
          />
        </DragDropItemSortableHandle>
        <StyledDropdownContainer>
          <FieldsConfigurationGroupDropdown
            groupId={group.id}
            onStartRename={handleStartRename}
            onDelete={() => onDeleteGroup({ groupId: group.id })}
            onAddGroup={onAddGroup}
          />
        </StyledDropdownContainer>
      </StyledGroupHeaderRow>

      <StyledFieldsDroppable>
        {sortedFields.length === 0 ? (
          <StyledEmptyGroupDropZone ref={fieldsEndDropRef}>
            {isFieldsEndDropTarget && <DragDropItemDropLine />}
            {t`Drop fields here`}
          </StyledEmptyGroupDropZone>
        ) : (
          <>
            {sortedFields.map((field, fieldIndex) => {
              const fieldDragData: FieldsConfigurationFieldDragData = {
                type: 'field',
                groupId: group.id,
                index: fieldIndex,
              };

              return (
                <DragDropItemSortableCell
                  key={field.fieldMetadataItem.id}
                  id={field.fieldMetadataItem.id}
                  index={fieldIndex}
                  group={group.id}
                  data={fieldDragData}
                  type={FIELDS_CONFIGURATION_FIELD_DND_TYPE}
                  accept={FIELDS_CONFIGURATION_FIELD_DND_TYPE}
                  hasTransition={false}
                  highlightWhileDragging
                  dropLine="horizontal"
                >
                  <FieldsConfigurationFieldEditor
                    field={{
                      fieldMetadataId: field.fieldMetadataItem.id,
                      position: field.position,
                      isVisible: field.isVisible,
                    }}
                    fieldMetadata={field.fieldMetadataItem}
                    onToggleVisibility={() => {
                      onToggleFieldVisibility(field.fieldMetadataItem.id);
                    }}
                  />
                </DragDropItemSortableCell>
              );
            })}
            <StyledFieldsEndDropZone ref={fieldsEndDropRef}>
              {isFieldsEndDropTarget && <DragDropItemDropLine />}
            </StyledFieldsEndDropZone>
          </>
        )}
      </StyledFieldsDroppable>
    </StyledGroupContainer>
  );
};
