import { RecordChip } from '@/object-record/components/RecordChip';
import { useGetMorphRelationRelatedRecordsWithObjectNameSingular } from '@/object-record/record-field-list/record-detail-section/relation/components/hooks/useGetMorphRelationRelatedRecordsWithObjectNameSingular';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMorphRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
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

type FieldWidgetMorphRelationProps = {
  fieldDefinition: FieldDefinition<FieldMorphRelationMetadata>;
  recordId: string;
  isInRightDrawer: boolean;
};

export const FieldWidgetMorphRelation = ({
  fieldDefinition,
  recordId,
  isInRightDrawer,
}: FieldWidgetMorphRelationProps) => {
  const fieldMetadata = fieldDefinition.metadata;

  const recordsWithObjectNameSingular =
    useGetMorphRelationRelatedRecordsWithObjectNameSingular({
      recordId,
      morphRelations: fieldMetadata.morphRelations,
    });

  if (recordsWithObjectNameSingular.length > 0) {
    return (
      <RightDrawerProvider value={{ isInRightDrawer }}>
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
