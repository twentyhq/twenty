import { RecordChip } from '@/object-record/components/RecordChip';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';

const StyledContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledRelationChipsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  flex-wrap: wrap;
`;

type FieldWidgetRelationProps = {
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
  relationValue: any;
  isInRightDrawer: boolean;
};

export const FieldWidgetRelation = ({
  fieldDefinition,
  relationValue,
  isInRightDrawer,
}: FieldWidgetRelationProps) => {
  const fieldMetadata = fieldDefinition.metadata;
  const isOneToMany = fieldMetadata.relationType === 'ONE_TO_MANY';
  const relationObjectNameSingular =
    fieldMetadata.relationObjectMetadataNameSingular;

  if (isOneToMany && Array.isArray(relationValue)) {
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

  if (!isOneToMany && isDefined(relationValue)) {
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
  }

  return (
    <RightDrawerProvider value={{ isInRightDrawer }}>
      <StyledContainer>
        <AnimatedPlaceholderEmptyContainer
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
        >
          <AnimatedPlaceholder type="noRecord" />
          <AnimatedPlaceholderEmptyTextContainer>
            <AnimatedPlaceholderEmptyTitle>
              {t`No related records`}
            </AnimatedPlaceholderEmptyTitle>
          </AnimatedPlaceholderEmptyTextContainer>
        </AnimatedPlaceholderEmptyContainer>
      </StyledContainer>
    </RightDrawerProvider>
  );
};
