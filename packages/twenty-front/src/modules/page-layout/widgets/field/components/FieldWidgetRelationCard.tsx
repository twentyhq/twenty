import { Fragment, useState } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { RecordDetailRelationRecordsListItem } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationRecordsListItem';
import { RecordDetailRelationRecordsListItemEffect } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationRecordsListItemEffect';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import {
  FieldInputEventContext,
  type FieldInputEvent,
} from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { usePersistField } from '@/object-record/record-field/ui/hooks/usePersistField';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFieldWidgetInstanceId } from '@/page-layout/widgets/field/utils/getFieldWidgetInstanceId';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
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

type FieldWidgetRelationCardProps = {
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
  relationValue: any;
  isInRightDrawer: boolean;
};

export const FieldWidgetRelationCard = ({
  fieldDefinition,
  relationValue,
  isInRightDrawer,
}: FieldWidgetRelationCardProps) => {
  const widget = useCurrentWidget();

  const [expandedItem, setExpandedItem] = useState('');
  const targetRecord = useTargetRecord();

  const instanceId = getFieldWidgetInstanceId({
    widgetId: widget.id,
    recordId: targetRecord.id,
    fieldName: fieldDefinition.metadata.fieldName,
    isInRightDrawer,
  });

  const handleItemClick = (recordId: string) =>
    setExpandedItem(recordId === expandedItem ? '' : recordId);

  const fieldMetadata = fieldDefinition.metadata;
  const relationObjectNameSingular =
    fieldMetadata.relationObjectMetadataNameSingular;
  const relationFieldMetadataId = fieldMetadata.relationFieldMetadataId;

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

  const records = Array.isArray(relationValue)
    ? relationValue
    : isDefined(relationValue)
      ? [relationValue]
      : [];

  if (records.length === 0) {
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
            {records.map((record) => (
              <Fragment key={record.id}>
                <RecordDetailRelationRecordsListItemEffect
                  relationRecordId={record.id}
                  relationObjectMetadataNameSingular={
                    relationObjectNameSingular
                  }
                />
                <RecordDetailRelationRecordsListItem
                  isExpanded={expandedItem === record.id}
                  onClick={handleItemClick}
                  relationRecord={record}
                  relationObjectMetadataNameSingular={
                    relationObjectNameSingular
                  }
                  relationFieldMetadataId={relationFieldMetadataId}
                />
              </Fragment>
            ))}
          </FieldInputEventContext.Provider>
        </FieldContext.Provider>
      </RecordFieldsScopeContextProvider>
    </RightDrawerProvider>
  );
};
