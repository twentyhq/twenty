import styled from '@emotion/styled';
import { Droppable, type DraggableProvided } from '@hello-pangea/dnd';
import { useLingui } from '@lingui/react/macro';

import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  type FieldsConfigurationFieldItem,
  type FieldsConfigurationSection,
} from '@/page-layout/types/FieldsConfiguration';
import { FieldsConfigurationFieldEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationFieldEditor';
import { IconDotsVertical, IconNewSection } from 'twenty-ui/display';
import { MenuItem, MenuItemDraggable } from 'twenty-ui/navigation';

const StyledFieldsDroppable = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledSectionContainer = styled.div<{ isDragging: boolean }>`
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

type FieldsConfigurationSectionEditorProps = {
  section: FieldsConfigurationSection;
  index: number;
  objectMetadataItem: ObjectMetadataItem;
  onSectionChange: (section: FieldsConfigurationSection) => void;
  draggableProvided: DraggableProvided;
  isDragging: boolean;
};

export const FieldsConfigurationSectionEditor = ({
  section,
  objectMetadataItem,
  onSectionChange,
  draggableProvided,
  isDragging,
}: FieldsConfigurationSectionEditorProps) => {
  const { t } = useLingui();

  const handleFieldChange = (
    fieldMetadataId: string,
    updatedField: FieldsConfigurationFieldItem,
  ) => {
    const updatedFields = section.fields.map((field) =>
      field.fieldMetadataId === fieldMetadataId ? updatedField : field,
    );

    onSectionChange({
      ...section,
      fields: updatedFields,
    });
  };

  const handleToggleFieldVisibility = (fieldMetadataId: string) => {
    const field = section.fields.find(
      (f) => f.fieldMetadataId === fieldMetadataId,
    );

    if (!field) {
      return;
    }

    const updatedField: FieldsConfigurationFieldItem = {
      ...field,
      conditionalDisplay: false,
    };

    handleFieldChange(fieldMetadataId, updatedField);
  };

  const sortedFields = [...section.fields].sort(
    (a, b) => a.position - b.position,
  );

  return (
    <StyledSectionContainer
      ref={draggableProvided.innerRef}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...draggableProvided.draggableProps}
      isDragging={isDragging}
    >
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <div {...draggableProvided.dragHandleProps}>
        <MenuItemDraggable
          text={section.title}
          gripMode="always"
          isIconDisplayedOnHoverOnly={false}
          withIconContainer
          iconButtons={[
            {
              Icon: IconDotsVertical,
              onClick: (e) => {
                e.stopPropagation();
                // TODO: Add section menu
              },
            },
          ]}
        />
      </div>

      <Droppable droppableId={`section-${section.id}`} type="FIELD">
        {(droppableProvided) => (
          <StyledFieldsDroppable
            ref={droppableProvided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...droppableProvided.droppableProps}
          >
            {sortedFields.map((field, fieldIndex) => {
              const fieldMetadata = objectMetadataItem.fields.find(
                (f) => f.id === field.fieldMetadataId,
              );

              if (!fieldMetadata) {
                return null;
              }

              return (
                <DraggableItem
                  key={field.fieldMetadataId}
                  draggableId={`field-${field.fieldMetadataId}`}
                  index={fieldIndex}
                  isInsideScrollableContainer
                  itemComponent={
                    <FieldsConfigurationFieldEditor
                      field={field}
                      fieldMetadata={fieldMetadata}
                      onToggleVisibility={() =>
                        handleToggleFieldVisibility(field.fieldMetadataId)
                      }
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
        onClick={() => {
          // TODO: Implement add section
        }}
      />
    </StyledSectionContainer>
  );
};
