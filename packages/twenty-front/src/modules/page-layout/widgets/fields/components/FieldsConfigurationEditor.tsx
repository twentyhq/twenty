import styled from '@emotion/styled';
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import {
  type FieldsConfiguration,
  type FieldsConfigurationFieldItem,
  type FieldsConfigurationSection,
} from '@/page-layout/types/FieldsConfiguration';
import { FieldsConfigurationSectionEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationSectionEditor';

const StyledSectionsDroppable = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type FieldsConfigurationEditorProps = {
  configuration: FieldsConfiguration;
  onChange: (configuration: FieldsConfiguration) => void;
};

export const FieldsConfigurationEditor = ({
  configuration,
  onChange,
}: FieldsConfigurationEditorProps) => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const handleSectionChange = (
    sectionId: string,
    updatedSection: FieldsConfigurationSection,
  ) => {
    const updatedSections = configuration.sections.map((section) =>
      section.id === sectionId ? updatedSection : section,
    );

    onChange({
      ...configuration,
      sections: updatedSections,
    });
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (type === 'SECTION') {
      handleSectionReorder(source.index, destination.index);
    } else if (type === 'FIELD') {
      handleFieldMove(
        source.droppableId,
        destination.droppableId,
        source.index,
        destination.index,
      );
    }
  };

  const handleSectionReorder = (
    sourceIndex: number,
    destinationIndex: number,
  ) => {
    const sortedSections = [...configuration.sections].sort(
      (a, b) => a.position - b.position,
    );

    const [movedSection] = sortedSections.splice(sourceIndex, 1);
    sortedSections.splice(destinationIndex, 0, movedSection);

    const updatedSections = sortedSections.map((section, index) => ({
      ...section,
      position: index,
    }));

    onChange({
      ...configuration,
      sections: updatedSections,
    });
  };

  const handleFieldMove = (
    sourceSectionId: string,
    destinationSectionId: string,
    sourceIndex: number,
    destinationIndex: number,
  ) => {
    const sourceSection = configuration.sections.find(
      (s) => `section-${s.id}` === sourceSectionId,
    );
    const destinationSection = configuration.sections.find(
      (s) => `section-${s.id}` === destinationSectionId,
    );

    if (!sourceSection || !destinationSection) {
      return;
    }

    const sourceSortedFields = [...sourceSection.fields].sort(
      (a, b) => a.position - b.position,
    );

    if (sourceSectionId === destinationSectionId) {
      // Reorder within the same section
      const [movedField] = sourceSortedFields.splice(sourceIndex, 1);
      sourceSortedFields.splice(destinationIndex, 0, movedField);

      const updatedFields = sourceSortedFields.map((field, index) => ({
        ...field,
        position: index,
      }));

      handleSectionChange(sourceSection.id, {
        ...sourceSection,
        fields: updatedFields,
      });
    } else {
      // Move field between sections
      const [movedField] = sourceSortedFields.splice(sourceIndex, 1);

      const destinationSortedFields = [...destinationSection.fields].sort(
        (a, b) => a.position - b.position,
      );
      destinationSortedFields.splice(destinationIndex, 0, movedField);

      const updatedSourceFields = sourceSortedFields.map(
        (field, index) =>
          ({
            ...field,
            position: index,
          }) satisfies FieldsConfigurationFieldItem,
      );

      const updatedDestinationFields = destinationSortedFields.map(
        (field, index) =>
          ({
            ...field,
            position: index,
          }) satisfies FieldsConfigurationFieldItem,
      );

      const updatedSections = configuration.sections.map((section) => {
        if (section.id === sourceSection.id) {
          return { ...section, fields: updatedSourceFields };
        }
        if (section.id === destinationSection.id) {
          return { ...section, fields: updatedDestinationFields };
        }
        return section;
      });

      onChange({
        ...configuration,
        sections: updatedSections,
      });
    }
  };

  const sortedSections = [...configuration.sections].sort(
    (a, b) => a.position - b.position,
  );

  if (sortedSections.length === 0) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="sections" type="SECTION">
        {(provided) => (
          <StyledSectionsDroppable
            ref={provided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...provided.droppableProps}
          >
            {sortedSections.map((section, index) => (
              <Draggable
                key={section.id}
                draggableId={`section-draggable-${section.id}`}
                index={index}
              >
                {(draggableProvided, snapshot) => (
                  <FieldsConfigurationSectionEditor
                    section={section}
                    index={index}
                    objectMetadataItem={objectMetadataItem}
                    onSectionChange={(updatedSection) =>
                      handleSectionChange(section.id, updatedSection)
                    }
                    draggableProvided={draggableProvided}
                    isDragging={snapshot.isDragging}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </StyledSectionsDroppable>
        )}
      </Droppable>
    </DragDropContext>
  );
};
