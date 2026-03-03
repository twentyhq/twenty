import { styled } from '@linaria/react';
import { Droppable, type DraggableProvided } from '@hello-pangea/dnd';
import { useLingui } from '@lingui/react/macro';

import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldsConfigurationFieldEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationFieldEditor';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { IconDotsVertical, IconNewSection } from 'twenty-ui/display';
import { MenuItem, MenuItemDraggable } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFieldsDroppable = styled.div`
  display: flex;
  flex-direction: column;
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
};

export const FieldsConfigurationGroupEditor = ({
  group,
  draggableProvided,
  isDragging,
  onAddGroup,
  onToggleFieldVisibility,
}: FieldsConfigurationGroupEditorProps) => {
  const { t } = useLingui();

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
      <div {...draggableProvided.dragHandleProps}>
        <MenuItemDraggable
          text={group.name}
          gripMode="always"
          isIconDisplayedOnHoverOnly={false}
          withIconContainer
          iconButtons={[
            {
              Icon: IconDotsVertical,
              onClick: (e) => {
                e.stopPropagation();
                // TODO: Add group menu
              },
            },
          ]}
        />
      </div>

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
