import styled from '@emotion/styled';
import { Droppable, type DraggableProvided } from '@hello-pangea/dnd';
import { useLingui } from '@lingui/react/macro';

import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldsConfigurationFieldEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationFieldEditor';
import { FieldsConfigurationGroupDropdown } from '@/page-layout/widgets/fields/components/FieldsConfigurationGroupDropdown';
import { FieldsConfigurationGroupRenameInput } from '@/page-layout/widgets/fields/components/FieldsConfigurationGroupRenameInput';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { IconNewSection } from 'twenty-ui/display';
import { MenuItem, MenuItemDraggable } from 'twenty-ui/navigation';

const StyledFieldsDroppable = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledGroupContainer = styled.div<{ isDragging: boolean }>`
  background: ${({ isDragging, theme }) =>
    isDragging ? theme.background.primary : 'transparent'};
  border: 1px solid
    ${({ isDragging, theme }) =>
      isDragging ? theme.color.blue : 'transparent'};
  border-radius: ${({ theme }) => theme.border.radius.md};
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
  right: ${({ theme }) => theme.spacing(1)};
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
`;

type FieldsConfigurationGroupEditorProps = {
  group: FieldsWidgetGroup;
  index: number;
  objectMetadataItem: ObjectMetadataItem;
  draggableProvided: DraggableProvided;
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
  draggableProvided,
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

  const renameDropdownId = `fields-configuration-group-rename-${group.id}`;

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

  const sortedFields = [...group.fields].sort(
    (a, b) => a.position - b.position,
  );

  return (
    <StyledGroupContainer
      ref={draggableProvided.innerRef}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...draggableProvided.draggableProps}
      isDragging={isDragging}
    >
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <StyledGroupHeaderRow {...draggableProvided.dragHandleProps}>
        <Dropdown
          dropdownId={renameDropdownId}
          clickableComponentWidth="100%"
          clickableComponent={
            <StyledMenuItemDraggableWrapper>
              <MenuItemDraggable
                text={group.name}
                gripMode="always"
                isIconDisplayedOnHoverOnly={false}
                withIconContainer
              />
            </StyledMenuItemDraggableWrapper>
          }
          disableClickForClickableComponent
          dropdownPlacement="bottom-start"
          dropdownOffset={{ x: 32 }}
          onClose={handleCancelRename}
          dropdownComponents={
            <DropdownContent widthInPixels={GenericDropdownContentWidth.Large}>
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
        <StyledDropdownContainer>
          <FieldsConfigurationGroupDropdown
            groupId={group.id}
            onStartRename={handleStartRename}
            onDelete={() => onDeleteGroup({ groupId: group.id })}
          />
        </StyledDropdownContainer>
      </StyledGroupHeaderRow>

      <Droppable droppableId={`group-${group.id}`} type="FIELD">
        {(droppableProvided) => (
          <StyledFieldsDroppable
            ref={droppableProvided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...droppableProvided.droppableProps}
          >
            {sortedFields.map((field, fieldIndex) => {
              return (
                <DraggableItem
                  key={field.fieldMetadataItem.id}
                  draggableId={`field-${field.fieldMetadataItem.id}`}
                  index={fieldIndex}
                  isInsideScrollableContainer
                  itemComponent={
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
                  }
                />
              );
            })}
            {droppableProvided.placeholder}
          </StyledFieldsDroppable>
        )}
      </Droppable>

      <MenuItem
        LeftIcon={IconNewSection}
        withIconContainer
        text={t`Add a Group`}
        onClick={onAddGroup}
      />
    </StyledGroupContainer>
  );
};
