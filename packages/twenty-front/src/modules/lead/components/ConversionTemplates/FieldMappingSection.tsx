import { useCallback } from 'react';
import styled from '@emotion/styled';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import { IconButton } from '@/ui/button/components/IconButton';
import { IconTrash, IconGripVertical, IconPlus } from '@/ui/icon';
import { Select } from '@/ui/input/components/Select';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledMappingRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

const StyledDragHandle = styled.div`
  cursor: grab;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledFieldSelect = styled.div`
  flex: 1;
`;

const StyledArrow = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  padding: ${({ theme }) => theme.spacing(0, 2)};
`;

const StyledAddButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1, 2)};
  color: ${({ theme }) => theme.font.color.primary};
  background: none;
  border: 1px dashed ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

interface FieldOption {
  value: string;
  label: string;
  type: string;
}

interface FieldMapping {
  id: string;
  sourceField: string;
  targetField: string;
}

interface FieldMappingSectionProps {
  sourceFields: FieldOption[];
  targetFields: FieldOption[];
  mappings: FieldMapping[];
  onChange: (mappings: FieldMapping[]) => void;
}

export const FieldMappingSection = ({
  sourceFields,
  targetFields,
  mappings,
  onChange,
}: FieldMappingSectionProps) => {
  const handleAddMapping = useCallback(() => {
    const newMapping: FieldMapping = {
      id: Math.random().toString(36).substr(2, 9),
      sourceField: '',
      targetField: '',
    };
    onChange([...mappings, newMapping]);
  }, [mappings, onChange]);

  const handleRemoveMapping = useCallback(
    (index: number) => {
      const newMappings = [...mappings];
      newMappings.splice(index, 1);
      onChange(newMappings);
    },
    [mappings, onChange],
  );

  const handleFieldChange = useCallback(
    (index: number, field: 'sourceField' | 'targetField', value: string) => {
      const newMappings = [...mappings];
      newMappings[index] = {
        ...newMappings[index],
        [field]: value,
      };
      onChange(newMappings);
    },
    [mappings, onChange],
  );

  const handleDragEnd = useCallback(
    (result: any) => {
      if (!result.destination) return;

      const items = Array.from(mappings);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      onChange(items);
    },
    [mappings, onChange],
  );

  return (
    <StyledContainer>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="field-mappings">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {mappings.map((mapping, index) => (
                <Draggable
                  key={mapping.id}
                  draggableId={mapping.id}
                  index={index}
                >
                  {(provided) => (
                    <StyledMappingRow
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <StyledDragHandle {...provided.dragHandleProps}>
                        <IconGripVertical />
                      </StyledDragHandle>
                      <StyledFieldSelect>
                        <Select
                          value={mapping.sourceField}
                          onChange={(value) =>
                            handleFieldChange(index, 'sourceField', value)
                          }
                          options={sourceFields}
                          placeholder="Select lead field"
                        />
                      </StyledFieldSelect>
                      <StyledArrow>→</StyledArrow>
                      <StyledFieldSelect>
                        <Select
                          value={mapping.targetField}
                          onChange={(value) =>
                            handleFieldChange(index, 'targetField', value)
                          }
                          options={targetFields}
                          placeholder="Select target field"
                        />
                      </StyledFieldSelect>
                      <IconButton
                        onClick={() => handleRemoveMapping(index)}
                        variant="tertiary"
                        icon={<IconTrash />}
                      />
                    </StyledMappingRow>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <StyledAddButton onClick={handleAddMapping}>
        <IconPlus size={16} />
        Add Field Mapping
      </StyledAddButton>
    </StyledContainer>
  );
};
