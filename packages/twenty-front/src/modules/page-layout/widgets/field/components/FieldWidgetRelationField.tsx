import { RecordChip } from '@/object-record/components/RecordChip';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  box-sizing: border-box;
  padding: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledRelationChipsContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  flex-wrap: wrap;
`;

type FieldWidgetRelationFieldProps = {
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
  relationValue: any;
  isInSidePanel: boolean;
};

export const FieldWidgetRelationField = ({
  fieldDefinition,
  relationValue,
  isInSidePanel,
}: FieldWidgetRelationFieldProps) => {
  const fieldMetadata = fieldDefinition.metadata;
  const isOneToMany = fieldMetadata.relationType === 'ONE_TO_MANY';
  const relationObjectNameSingular =
    fieldMetadata.relationObjectMetadataNameSingular;

  if (isOneToMany && !Array.isArray(relationValue)) {
    return null;
  }

  if (!isOneToMany && !isDefined(relationValue)) {
    return null;
  }

  if (isOneToMany) {
    return (
      <SidePanelProvider value={{ isInSidePanel }}>
        <StyledContainer>
          <StyledRelationChipsContainer>
            {relationValue.map((relatedRecord: any) => (
              <RecordChip
                key={relatedRecord.id}
                objectNameSingular={relationObjectNameSingular}
                record={relatedRecord}
              />
            ))}
          </StyledRelationChipsContainer>
        </StyledContainer>
      </SidePanelProvider>
    );
  }

  return (
    <SidePanelProvider value={{ isInSidePanel }}>
      <StyledContainer>
        <StyledRelationChipsContainer>
          <RecordChip
            objectNameSingular={relationObjectNameSingular}
            record={relationValue}
          />
        </StyledRelationChipsContainer>
      </StyledContainer>
    </SidePanelProvider>
  );
};
