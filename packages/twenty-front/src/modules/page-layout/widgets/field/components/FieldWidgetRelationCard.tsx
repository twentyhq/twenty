import { styled } from '@linaria/react';
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
import { FieldWidgetShowMoreButton } from '@/page-layout/widgets/field/components/FieldWidgetShowMoreButton';
import { FIELD_WIDGET_RELATION_CARD_INITIAL_VISIBLE_ITEMS } from '@/page-layout/widgets/field/constants/FieldWidgetRelationCardInitialVisibleItems';
import { FIELD_WIDGET_RELATION_CARD_LOAD_MORE_INCREMENT } from '@/page-layout/widgets/field/constants/FieldWidgetRelationCardLoadMoreIncrement';
import { generateFieldWidgetInstanceId } from '@/page-layout/widgets/field/utils/generateFieldWidgetInstanceId';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledShowMoreButtonContainer = styled.div`
  padding-top: ${themeCssVariables.spacing[2]};
`;

type FieldWidgetRelationCardProps = {
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
  relationValue: any;
  isInSidePanel: boolean;
};

export const FieldWidgetRelationCard = ({
  fieldDefinition,
  relationValue,
  isInSidePanel,
}: FieldWidgetRelationCardProps) => {
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
    isInSidePanel,
  });

  const handleItemClick = (recordId: string) =>
    setExpandedItem(recordId === expandedItem ? '' : recordId);

  const handleShowMore = () => {
    setVisibleItemsCount(
      (prevCount) => prevCount + FIELD_WIDGET_RELATION_CARD_LOAD_MORE_INCREMENT,
    );
  };

  const fieldMetadata = fieldDefinition.metadata;
  const relationObjectNameSingular =
    fieldMetadata.relationObjectMetadataNameSingular;
  const relationFieldMetadataId = fieldMetadata.relationFieldMetadataId;

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

  const records = Array.isArray(relationValue)
    ? relationValue
    : isDefined(relationValue)
      ? [relationValue]
      : [];

  if (records.length === 0) {
    return null;
  }

  const visibleRecords = records.slice(0, visibleItemsCount);
  const remainingCount = records.length - visibleItemsCount;
  const hasMoreRecords = remainingCount > 0;

  return (
    <SidePanelProvider value={{ isInSidePanel }}>
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
            {visibleRecords.map((record) => (
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
            {hasMoreRecords && (
              <StyledShowMoreButtonContainer>
                <FieldWidgetShowMoreButton
                  remainingCount={remainingCount}
                  onClick={handleShowMore}
                />
              </StyledShowMoreButtonContainer>
            )}
          </FieldInputEventContext.Provider>
        </FieldContext.Provider>
      </RecordFieldsScopeContextProvider>
    </SidePanelProvider>
  );
};
