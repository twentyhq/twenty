import styled from '@emotion/styled';
import { Droppable, type DraggableProvided } from '@hello-pangea/dnd';
import { useLingui } from '@lingui/react/macro';

import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldsConfigurationFieldEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationFieldEditor';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { IconDotsVertical, IconNewSection } from 'twenty-ui/display';
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
