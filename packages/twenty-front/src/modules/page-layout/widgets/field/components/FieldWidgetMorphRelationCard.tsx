import styled from '@emotion/styled';
import { Fragment, useState } from 'react';

import { RecordDetailRecordsListContainer } from '@/object-record/record-field-list/record-detail-section/components/RecordDetailRecordsListContainer';
import { RecordDetailRelationRecordsListItem } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationRecordsListItem';
import { RecordDetailRelationRecordsListItemEffect } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationRecordsListItemEffect';
import { useGetMorphRelationRelatedRecordsWithObjectNameSingular } from '@/object-record/record-field-list/record-detail-section/relation/components/hooks/useGetMorphRelationRelatedRecordsWithObjectNameSingular';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMorphRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
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

type FieldWidgetMorphRelationCardProps = {
  fieldDefinition: FieldDefinition<FieldMorphRelationMetadata>;
  recordId: string;
  isInRightDrawer: boolean;
};

export const FieldWidgetMorphRelationCard = ({
  fieldDefinition,
  recordId,
  isInRightDrawer,
}: FieldWidgetMorphRelationCardProps) => {
  const [expandedItem, setExpandedItem] = useState('');

  const handleItemClick = (id: string) =>
    setExpandedItem(id === expandedItem ? '' : id);

  const fieldMetadata = fieldDefinition.metadata;

  const recordsWithObjectNameSingular =
    useGetMorphRelationRelatedRecordsWithObjectNameSingular({
      recordId,
      morphRelations: fieldMetadata.morphRelations,
    });

  const validRecords = recordsWithObjectNameSingular.filter((item) =>
    isDefined(item.value),
  );

  if (validRecords.length === 0) {
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
  }

  return (
    <RightDrawerProvider value={{ isInRightDrawer }}>
      <StyledContainer>
        <RecordDetailRecordsListContainer>
          {validRecords.map((item) => (
            <Fragment key={`${item.value.id}-${item.fieldMetadataId}`}>
              <RecordDetailRelationRecordsListItemEffect
                relationRecordId={item.value.id}
                relationObjectMetadataNameSingular={item.objectNameSingular}
              />
              <RecordDetailRelationRecordsListItem
                isExpanded={expandedItem === item.value.id}
                onClick={handleItemClick}
                relationRecord={item.value}
                relationObjectMetadataNameSingular={item.objectNameSingular}
                relationFieldMetadataId={item.fieldMetadataId}
              />
            </Fragment>
          ))}
        </RecordDetailRecordsListContainer>
      </StyledContainer>
    </RightDrawerProvider>
  );
};
