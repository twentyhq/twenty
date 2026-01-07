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
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
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
  const targetRecord = useTargetRecord();

  const handleItemClick = (id: string) =>
    setExpandedItem(id === expandedItem ? '' : id);

  const fieldMetadata = fieldDefinition.metadata;

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const useUpdateOneObjectRecordMutation = () => {
    const updateEntity = ({
      variables,
    }: {
      variables: {
        where: { id: string };
        updateOneRecordInput: Record<string, unknown>;
      };
    }) => {
      updateOneRecord?.({
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

  const scopeInstanceId = `field-widget-morph-relation-card-${targetRecord.id}-${fieldDefinition.fieldMetadataId}`;

  if (validRecords.length === 0) {
    return (
      <RightDrawerProvider value={{ isInRightDrawer }}>
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
      </RightDrawerProvider>
    );
  }

  return (
    <RightDrawerProvider value={{ isInRightDrawer }}>
      <RecordFieldsScopeContextProvider value={{ scopeInstanceId }}>
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
          </FieldInputEventContext.Provider>
        </FieldContext.Provider>
      </RecordFieldsScopeContextProvider>
    </RightDrawerProvider>
  );
};
