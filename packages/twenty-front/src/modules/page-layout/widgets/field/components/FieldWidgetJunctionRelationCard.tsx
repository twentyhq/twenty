import { styled } from '@linaria/react';
import { Fragment, useState } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { RecordDetailRecordsListContainer } from '@/object-record/record-field-list/record-detail-section/components/RecordDetailRecordsListContainer';
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
import { extractTargetRecordsFromJunction } from '@/object-record/record-field/ui/utils/junction/extractTargetRecordsFromJunction';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
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

type FieldWidgetJunctionRelationCardProps = {
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
  relationValue: any;
  isInSidePanel: boolean;
  sourceObjectMetadataId: string;
};

export const FieldWidgetJunctionRelationCard = ({
  fieldDefinition,
  relationValue,
  isInSidePanel,
  sourceObjectMetadataId,
}: FieldWidgetJunctionRelationCardProps) => {
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

  const handleItemClick = (id: string) =>
    setExpandedItem(id === expandedItem ? '' : id);

  const handleShowMore = () => {
    setVisibleItemsCount(
      (prevCount) => prevCount + FIELD_WIDGET_RELATION_CARD_LOAD_MORE_INCREMENT,
    );
  };

  const fieldMetadata = fieldDefinition.metadata;

  const { objectMetadataItems } = useObjectMetadataItems();

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

  const junctionConfig = getJunctionConfig({
    settings: fieldMetadata.settings,
    relationObjectMetadataId: fieldMetadata.relationObjectMetadataId,
    sourceObjectMetadataId,
    objectMetadataItems,
  });

  if (!isDefined(junctionConfig)) {
    return null;
  }

  const junctionRecords = Array.isArray(relationValue) ? relationValue : [];

  const extractedRecords = extractTargetRecordsFromJunction({
    junctionRecords,
    targetFields: junctionConfig.targetFields,
    objectMetadataItems,
    includeRecord: true,
  });

  const targetRecordsWithMetadata = extractedRecords
    .map((extracted) => {
      const objectMetadata = objectMetadataItems.find(
        (item) => item.id === extracted.objectMetadataId,
      );
      if (!objectMetadata || !extracted.record) {
        return null;
      }
      return {
        record: extracted.record,
        objectNameSingular: objectMetadata.nameSingular,
      };
    })
    .filter(isDefined);

  if (targetRecordsWithMetadata.length === 0) {
    return null;
  }

  const visibleRecords = targetRecordsWithMetadata.slice(0, visibleItemsCount);
  const remainingCount = targetRecordsWithMetadata.length - visibleItemsCount;
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
            // Junction card detach/delete logic in RecordDetailRelationRecordsListItem
            // assumes direct relations. Force read-only to prevent data corruption.
            isRecordFieldReadOnly: true,
          }}
        >
          <FieldInputEventContext.Provider value={{ onSubmit: handleSubmit }}>
            <RecordDetailRecordsListContainer>
              {visibleRecords.map((item) => (
                <Fragment key={item.record.id}>
                  <RecordDetailRelationRecordsListItemEffect
                    relationRecordId={item.record.id}
                    relationObjectMetadataNameSingular={item.objectNameSingular}
                  />
                  <RecordDetailRelationRecordsListItem
                    isExpanded={expandedItem === item.record.id}
                    onClick={handleItemClick}
                    relationRecord={item.record}
                    relationObjectMetadataNameSingular={item.objectNameSingular}
                    relationFieldMetadataId=""
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
    </SidePanelProvider>
  );
};
