import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';

import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';

import { FieldsConfigurationFieldEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationFieldEditor';
import { type FieldsWidgetGroupField } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconNewSection } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

const StyledFieldsDroppable = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type FieldsConfigurationUngroupedEditorProps = {
  ungroupedFields: FieldsWidgetGroupField[];
  onMoveField: (sourceIndex: number, destinationIndex: number) => void;
  onToggleFieldVisibility: (fieldMetadataId: string) => void;
  onAddGroup: () => void;
};

export const FieldsConfigurationUngroupedEditor = ({
  ungroupedFields,
  onMoveField,
  onToggleFieldVisibility,
  onAddGroup,
}: FieldsConfigurationUngroupedEditorProps) => {
  const { t } = useLingui();

  const sortedFields = [...ungroupedFields].sort(
    (a, b) => a.position - b.position,
  );

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.index === destination.index) {
      return;
    }

    onMoveField(source.index, destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="ungrouped-fields" type="FIELD">
        {(provided) => (
          <StyledFieldsDroppable
            ref={provided.innerRef}
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...provided.droppableProps}
          >
            {sortedFields.map((field, fieldIndex) => (
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
            ))}
            {provided.placeholder}

            <MenuItem
              LeftIcon={IconNewSection}
              withIconContainer
              text={t`Add a Section`}
              onClick={onAddGroup}
            />
          </StyledFieldsDroppable>
        )}
      </Droppable>
    </DragDropContext>
  );
};
