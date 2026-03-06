import { RecordChip } from '@/object-record/components/RecordChip';
import { useGetMorphRelationRelatedRecordsWithObjectNameSingular } from '@/object-record/record-field-list/record-detail-section/relation/components/hooks/useGetMorphRelationRelatedRecordsWithObjectNameSingular';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMorphRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  box-sizing: border-box;
  padding: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledRelationChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

type FieldWidgetMorphRelationFieldProps = {
  fieldDefinition: FieldDefinition<FieldMorphRelationMetadata>;
  recordId: string;
  isInSidePanel: boolean;
};

export const FieldWidgetMorphRelationField = ({
  fieldDefinition,
  recordId,
  isInSidePanel,
}: FieldWidgetMorphRelationFieldProps) => {
  const fieldMetadata = fieldDefinition.metadata;

  const recordsWithObjectNameSingular =
    useGetMorphRelationRelatedRecordsWithObjectNameSingular({
      recordId,
      morphRelations: fieldMetadata.morphRelations,
    });

  if (recordsWithObjectNameSingular.length === 0) {
    return null;
  }

  return (
    <SidePanelProvider value={{ isInSidePanel }}>
      <StyledContainer>
        <StyledRelationChipsContainer>
          {recordsWithObjectNameSingular.map((morphItem, index) => (
            <RecordChip
              key={morphItem.value?.id ?? index}
              objectNameSingular={morphItem.objectNameSingular}
              record={morphItem.value}
            />
          ))}
        </StyledRelationChipsContainer>
      </StyledContainer>
    </SidePanelProvider>
  );
};
