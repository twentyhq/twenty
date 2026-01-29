import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import {
  type FieldsConfiguration,
  type FieldsConfigurationSection,
} from '@/page-layout/types/FieldsConfiguration';
import { FieldsConfigurationSectionEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationSectionEditor';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import styled from '@emotion/styled';
import {
  DragDropContext,
  Droppable,
  type OnDragEndResponder,
} from '@hello-pangea/dnd';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;
`;

type FieldsConfigurationEditorProps = {
  configuration: FieldsConfiguration;
  onChange: (configuration: FieldsConfiguration) => void;
};

export const FieldsConfigurationEditor = ({
  configuration,
  onChange,
}: FieldsConfigurationEditorProps) => {
  const targetRecord = useTargetRecord();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  // Unified drag handler for both sections and fields
  const handleDragEnd: OnDragEndResponder = useCallback(
    (result) => {
      if (!result.destination) {
        return;
      }

      const { source, destination } = result;

      // Check if we're dragging a section (droppableId will be 'sections')
      if (source.droppableId === 'sections') {
        // Section reordering
        const sourceIndex = source.index;
        const destinationIndex = destination.index;

        if (sourceIndex === destinationIndex) {
          return;
        }

        const sortedSections = [...configuration.sections].sort(
          (a, b) => a.position - b.position,
        );

        const reorderedSections = [...sortedSections];
        const [removed] = reorderedSections.splice(sourceIndex, 1);
        reorderedSections.splice(destinationIndex, 0, removed);

        const updatedSections = reorderedSections.map((section, index) => ({
          ...section,
          position: index,
        }));

        onChange({
          ...configuration,
          sections: updatedSections,
        });
        return;
      }

      // Field dragging within or between sections
      const sourceSectionId = source.droppableId;
      const destinationSectionId = destination.droppableId;
      const sourceIndex = source.index;
      const destinationIndex = destination.index;

      // If dropped in the same location, do nothing
      if (
        sourceSectionId === destinationSectionId &&
        sourceIndex === destinationIndex
      ) {
        return;
      }

      const sourceSection = configuration.sections.find(
        (s) => s.id === sourceSectionId,
      );
      const destinationSection = configuration.sections.find(
        (s) => s.id === destinationSectionId,
      );

      if (!sourceSection || !destinationSection) {
        return;
      }

      // Sort fields by position
      const sourceSortedFields = [...sourceSection.fields].sort(
        (a, b) => a.position - b.position,
      );

      // Get the field being moved
      const [movedField] = sourceSortedFields.splice(sourceIndex, 1);

      let updatedSections: FieldsConfigurationSection[];

      if (sourceSectionId === destinationSectionId) {
        // Moving within the same section
        sourceSortedFields.splice(destinationIndex, 0, movedField);

        const reorderedFields = sourceSortedFields.map((field, idx) => ({
          ...field,
          position: idx,
        }));

        updatedSections = configuration.sections.map((section) =>
          section.id === sourceSectionId
            ? { ...section, fields: reorderedFields }
            : section,
        );
      } else {
        // Moving between sections
        const destSortedFields = [...destinationSection.fields].sort(
          (a, b) => a.position - b.position,
        );
        destSortedFields.splice(destinationIndex, 0, movedField);

        const reorderedSourceFields = sourceSortedFields.map((field, idx) => ({
          ...field,
          position: idx,
        }));
        const reorderedDestFields = destSortedFields.map((field, idx) => ({
          ...field,
          position: idx,
        }));

        updatedSections = configuration.sections.map((section) => {
          if (section.id === sourceSectionId) {
            return { ...section, fields: reorderedSourceFields };
          }
          if (section.id === destinationSectionId) {
            return { ...section, fields: reorderedDestFields };
          }
          return section;
        });
      }

      onChange({
        ...configuration,
        sections: updatedSections,
      });
    },
    [configuration, onChange],
  );

  const handleSectionChange = useCallback(
    (sectionId: string, updatedSection: FieldsConfigurationSection) => {
      const updatedSections = configuration.sections.map((section) =>
        section.id === sectionId ? updatedSection : section,
      );

      onChange({
        ...configuration,
        sections: updatedSections,
      });
    },
    [configuration, onChange],
  );

  const sortedSections = [...configuration.sections].sort(
    (a, b) => a.position - b.position,
  );

  if (sortedSections.length === 0) {
    return (
      <StyledContainer>
        <StyledEmptyState>{t`No sections configured`}</StyledEmptyState>
      </StyledContainer>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <StyledContainer>
        <Droppable droppableId="sections">
          {(provided) => (
            <div
              ref={provided.innerRef}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...provided.droppableProps}
            >
              {sortedSections.map((section, index) => (
                <DraggableItem
                  key={section.id}
                  draggableId={section.id}
                  index={index}
                  itemComponent={
                    <FieldsConfigurationSectionEditor
                      section={section}
                      index={index}
                      objectMetadataItem={objectMetadataItem}
                      onSectionChange={(updatedSection) =>
                        handleSectionChange(section.id, updatedSection)
                      }
                    />
                  }
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </StyledContainer>
    </DragDropContext>
  );
};
