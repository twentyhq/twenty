import styled from '@emotion/styled';
import { Fragment, useState } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { RecordDetailRecordsListContainer } from '@/object-record/record-field-list/record-detail-section/components/RecordDetailRecordsListContainer';
import { RecordDetailRelationRecordsListItem } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationRecordsListItem';
import { RecordDetailRelationRecordsListItemEffect } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationRecordsListItemEffect';
import { useGetMorphRelationRelatedRecordsWithObjectNameSingular } from '@/object-record/record-field-list/record-detail-section/relation/components/hooks/useGetMorphRelationRelatedRecordsWithObjectNameSingular';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import {
  FieldInputEventContext,
  type FieldInputEvent,
} from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { usePersistField } from '@/object-record/record-field/ui/hooks/usePersistField';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMorphRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FieldWidgetShowMoreButton } from '@/page-layout/widgets/field/components/FieldWidgetShowMoreButton';
import { FIELD_WIDGET_RELATION_CARD_INITIAL_VISIBLE_ITEMS } from '@/page-layout/widgets/field/constants/FieldWidgetRelationCardInitialVisibleItems';
import { FIELD_WIDGET_RELATION_CARD_LOAD_MORE_INCREMENT } from '@/page-layout/widgets/field/constants/FieldWidgetRelationCardLoadMoreIncrement';
import { generateFieldWidgetInstanceId } from '@/page-layout/widgets/field/utils/generateFieldWidgetInstanceId';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import { isDefined } from 'twenty-shared/utils';

const StyledShowMoreButtonContainer = styled.div`
  padding-top: ${({ theme }) => theme.spacing(2)};
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
  const widget = useCurrentWidget();

  const [expandedItem, setExpandedItem] = useState('');
  const [visibleItemsCount, setVisibleItemsCount] = useState(
    FIELD_WIDGET_RELATION_CARD_INITIAL_VISIBLE_ITEMS,
  );
  const targetRecord = useTargetRecord();

  const instanceId = generateFieldWidgetInstanceId({
    widgetId: widget.id,
    recordId: targetRecord.id,
    fieldName: fieldDefinition.metadata.fieldName,
    isInRightDrawer,
  });

  const handleItemClick = (id: string) =>
    setExpandedItem(id === expandedItem ? '' : id);

  const handleShowMore = () => {
    setVisibleItemsCount(
      (prevCount) => prevCount + FIELD_WIDGET_RELATION_CARD_LOAD_MORE_INCREMENT,
    );
  };

  const fieldMetadata = fieldDefinition.metadata;

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const { updateOneRecord } = useUpdateOneRecord();

  const useUpdateOneObjectRecordMutation = () => {
    const updateEntity = ({
      variables,
    }: {
      variables: {
        where: { id: string };
        updateOneRecordInput: Record<string, unknown>;
      };
    }) => {
      updateOneRecord({
        objectNameSingular: targetRecord.targetObjectNameSingular,
        idToUpdate: variables.where.id,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };
    return [updateEntity, { loading: false }] as [
      (params: any) => void,
      { loading: boolean },
    ];
  };

  const isRecordFieldReadOnly = useIsRecordFieldReadOnly({
    recordId: targetRecord.id,
    fieldMetadataId: fieldDefinition.fieldMetadataId,
    objectMetadataId: objectMetadataItem.id,
  });

  const persistField = usePersistField({
    objectMetadataItemId: objectMetadataItem.id,
  });

  const handleSubmit: FieldInputEvent = ({ newValue }) => {
    persistField({
      recordId: targetRecord.id,
      fieldDefinition,
      valueToPersist: newValue,
    });
  };

  const recordsWithObjectNameSingular =
    useGetMorphRelationRelatedRecordsWithObjectNameSingular({
      recordId,
      morphRelations: fieldMetadata.morphRelations,
    });

  const validRecords = recordsWithObjectNameSingular.filter((item) =>
    isDefined(item.value),
  );

  if (validRecords.length === 0) {
    return null;
  }

  const visibleRecords = validRecords.slice(0, visibleItemsCount);
  const remainingCount = validRecords.length - visibleItemsCount;
  const hasMoreRecords = remainingCount > 0;

  return (
    <RightDrawerProvider value={{ isInRightDrawer }}>
      <RecordFieldsScopeContextProvider value={{ scopeInstanceId: instanceId }}>
        <FieldContext.Provider
          value={{
            recordId: targetRecord.id,
            isLabelIdentifier: false,
            fieldDefinition,
            useUpdateRecord: useUpdateOneObjectRecordMutation,
            isRecordFieldReadOnly,
          }}
        >
          <FieldInputEventContext.Provider value={{ onSubmit: handleSubmit }}>
            <RecordDetailRecordsListContainer>
              {visibleRecords.map((item) => (
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
              {hasMoreRecords && (
                <StyledShowMoreButtonContainer>
                  <FieldWidgetShowMoreButton
                    remainingCount={remainingCount}
                    onClick={handleShowMore}
                  />
                </StyledShowMoreButtonContainer>
              )}
            </RecordDetailRecordsListContainer>
          </FieldInputEventContext.Provider>
        </FieldContext.Provider>
      </RecordFieldsScopeContextProvider>
    </RightDrawerProvider>
  );
};
