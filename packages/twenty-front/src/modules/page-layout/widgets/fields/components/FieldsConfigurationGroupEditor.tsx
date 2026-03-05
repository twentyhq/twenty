import { Droppable, type DraggableProvided } from '@hello-pangea/dnd';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldsConfigurationFieldEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationFieldEditor';
import { FieldsConfigurationGroupDropdown } from '@/page-layout/widgets/fields/components/FieldsConfigurationGroupDropdown';
import { FieldsConfigurationGroupRenameInput } from '@/page-layout/widgets/fields/components/FieldsConfigurationGroupRenameInput';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { getFieldsConfigurationGroupRenameDropdownId } from '@/page-layout/widgets/fields/utils/getFieldsConfigurationGroupRenameDropdownId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { IconNewSection } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

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

  const sortedFields = [...group.fields].sort(
    (a, b) => a.position - b.position,
  );

  return (
    <StyledGroupContainer
      ref={draggableProvided.innerRef}
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...draggableProvided.draggableProps}
      isDragging={isDragging}
    >
      {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
      <StyledGroupHeaderRow {...draggableProvided.dragHandleProps}>
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
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...droppableProvided.droppableProps}
          >
            {sortedFields.length === 0 && (
              <StyledEmptyGroupDropZone>
                {t`Drop fields here`}
              </StyledEmptyGroupDropZone>
            )}
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
        text={t`Add a Section`}
        onClick={onAddGroup}
      />
    </StyledGroupContainer>
  );
};
