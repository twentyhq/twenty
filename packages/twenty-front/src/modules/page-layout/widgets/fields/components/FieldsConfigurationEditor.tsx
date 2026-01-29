import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import {
  type FieldsConfiguration,
  type FieldsConfigurationSection,
} from '@/page-layout/types/FieldsConfiguration';
import { FieldsConfigurationSectionEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationSectionEditor';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import styled from '@emotion/styled';
import { DragDropContext, type OnDragEndResponder } from '@hello-pangea/dnd';
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

  // Handle section reordering
  const handleSectionDragEnd: OnDragEndResponder = useCallback(
    (result) => {
      if (!result.destination) {
        return;
      }

      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;

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
    },
    [configuration, onChange],
  );

  // Handle field dragging within and between sections
  const handleFieldDragEnd: OnDragEndResponder = useCallback(
    (result) => {
      if (!result.destination) {
        return;
      }

      const sourceSectionId = result.source.droppableId;
      const destinationSectionId = result.destination.droppableId;
      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;

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

  const handleDeleteSection = useCallback(
    (sectionId: string) => {
      const updatedSections = configuration.sections
        .filter((section) => section.id !== sectionId)
        .map((section, index) => ({
          ...section,
          position: index,
        }));

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
    <StyledContainer>
      <DragDropContext onDragEnd={handleFieldDragEnd}>
        <DraggableList
          onDragEnd={handleSectionDragEnd}
          draggableItems={sortedSections.map((section, index) => (
            <FieldsConfigurationSectionEditor
              key={section.id}
              section={section}
              index={index}
              objectMetadataItem={objectMetadataItem}
              onSectionChange={(updatedSection) =>
                handleSectionChange(section.id, updatedSection)
              }
              onDeleteSection={() => handleDeleteSection(section.id)}
            />
          ))}
        />
      </DragDropContext>
    </StyledContainer>
  );
};
