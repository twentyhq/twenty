import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import {
  type FieldsConfiguration,
  type FieldsConfigurationSection,
} from '@/page-layout/types/FieldsConfiguration';
import { FieldsConfigurationSectionEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationSectionEditor';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import styled from '@emotion/styled';
import { type OnDragEndResponder } from '@hello-pangea/dnd';
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

  const handleDragEnd: OnDragEndResponder = useCallback(
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
      <DraggableList
        onDragEnd={handleDragEnd}
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
    </StyledContainer>
  );
};
