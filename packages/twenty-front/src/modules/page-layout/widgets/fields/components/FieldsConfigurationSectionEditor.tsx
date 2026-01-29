import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  type FieldsConfigurationFieldItem,
  type FieldsConfigurationSection,
} from '@/page-layout/types/FieldsConfiguration';
import { FieldsConfigurationFieldEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationFieldEditor';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import styled from '@emotion/styled';
import { Droppable } from '@hello-pangea/dnd';
import { t } from '@lingui/core/macro';
import { useCallback, useState } from 'react';
import {
  IconChevronDown,
  IconChevronRight,
  IconGripVertical,
} from 'twenty-ui/display';

const StyledSectionContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  overflow: hidden;
`;

const StyledSectionHeader = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.tertiary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  user-select: none;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledDragHandle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: grab;
  display: flex;

  &:active {
    cursor: grabbing;
  }
`;

const StyledChevronIcon = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
`;

const StyledSectionTitle = styled.input`
  background: transparent;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  outline: none;
  padding: ${({ theme }) => theme.spacing(1)};

  &:hover {
    border-color: ${({ theme }) => theme.border.color.medium};
  }

  &:focus {
    border-color: ${({ theme }) => theme.border.color.strong};
  }
`;

const StyledFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: center;
`;

type FieldsConfigurationSectionEditorProps = {
  section: FieldsConfigurationSection;
  index: number;
  objectMetadataItem: ObjectMetadataItem;
  onSectionChange: (section: FieldsConfigurationSection) => void;
};

export const FieldsConfigurationSectionEditor = ({
  section,
  index,
  objectMetadataItem,
  onSectionChange,
}: FieldsConfigurationSectionEditorProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onSectionChange({
        ...section,
        title: event.target.value,
      });
    },
    [section, onSectionChange],
  );

  const handleFieldChange = useCallback(
    (fieldMetadataId: string, updatedField: FieldsConfigurationFieldItem) => {
      const updatedFields = section.fields.map((field) =>
        field.fieldMetadataId === fieldMetadataId ? updatedField : field,
      );

      onSectionChange({
        ...section,
        fields: updatedFields,
      });
    },
    [section, onSectionChange],
  );

  const handleToggleFieldVisibility = useCallback(
    (fieldMetadataId: string) => {
      const field = section.fields.find(
        (f) => f.fieldMetadataId === fieldMetadataId,
      );

      if (!field) {
        return;
      }

      const currentlyVisible = field.isVisible !== false;

      const updatedField: FieldsConfigurationFieldItem = {
        ...field,
        isVisible: !currentlyVisible,
      };

      handleFieldChange(fieldMetadataId, updatedField);
    },
    [section.fields, handleFieldChange],
  );

  const sortedFields = [...section.fields].sort(
    (a, b) => a.position - b.position,
  );

  const sectionContent = (
    <StyledSectionContainer>
      <StyledSectionHeader
        onClick={(e) => {
          // Don't toggle if clicking on the input
          if ((e.target as HTMLElement).tagName !== 'INPUT') {
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <StyledDragHandle onClick={(e) => e.stopPropagation()}>
          <IconGripVertical size={16} />
        </StyledDragHandle>
        <StyledChevronIcon>
          {isExpanded ? (
            <IconChevronDown size={16} />
          ) : (
            <IconChevronRight size={16} />
          )}
        </StyledChevronIcon>
        <StyledSectionTitle
          value={section.title}
          onChange={handleTitleChange}
          onClick={(e) => e.stopPropagation()}
        />
      </StyledSectionHeader>
      {isExpanded && (
        <StyledFieldsContainer>
          {sortedFields.length === 0 ? (
            <StyledEmptyState>{t`No fields in this section`}</StyledEmptyState>
          ) : (
            <Droppable droppableId={section.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...provided.droppableProps}
                >
                  {sortedFields.map((field, fieldIndex) => {
                    const fieldMetadata = objectMetadataItem.fields.find(
                      (f) => f.id === field.fieldMetadataId,
                    );

                    if (!fieldMetadata) {
                      return null;
                    }

                    return (
                      <FieldsConfigurationFieldEditor
                        key={field.fieldMetadataId}
                        field={field}
                        fieldMetadata={fieldMetadata}
                        index={fieldIndex}
                        onToggleVisibility={() =>
                          handleToggleFieldVisibility(field.fieldMetadataId)
                        }
                      />
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </StyledFieldsContainer>
      )}
    </StyledSectionContainer>
  );

  return (
    <DraggableItem
      draggableId={section.id}
      index={index}
      itemComponent={sectionContent}
    />
  );
};
