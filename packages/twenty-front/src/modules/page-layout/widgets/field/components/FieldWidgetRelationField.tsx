import { RecordChip } from '@/object-record/components/RecordChip';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  box-sizing: border-box;
  padding: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledRelationChipsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  flex-wrap: wrap;
`;

type FieldWidgetRelationFieldProps = {
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
  relationValue: any;
  isInRightDrawer: boolean;
};

export const FieldWidgetRelationField = ({
  fieldDefinition,
  relationValue,
  isInRightDrawer,
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
      <RightDrawerProvider value={{ isInRightDrawer }}>
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
      </RightDrawerProvider>
    );
  }

  return (
    <RightDrawerProvider value={{ isInRightDrawer }}>
      <StyledContainer>
        <StyledRelationChipsContainer>
          <RecordChip
            objectNameSingular={relationObjectNameSingular}
            record={relationValue}
          />
        </StyledRelationChipsContainer>
      </StyledContainer>
    </RightDrawerProvider>
  );
};
