import { styled } from '@linaria/react';
import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
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
import {
  type FieldMorphRelationMetadata,
  type FieldRelationMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { FieldWidgetShowMoreButton } from '@/page-layout/widgets/field/components/FieldWidgetShowMoreButton';
import { FIELD_WIDGET_RELATION_CARD_INITIAL_VISIBLE_ITEMS } from '@/page-layout/widgets/field/constants/FieldWidgetRelationCardInitialVisibleItems';
import { FIELD_WIDGET_RELATION_CARD_LOAD_MORE_INCREMENT } from '@/page-layout/widgets/field/constants/FieldWidgetRelationCardLoadMoreIncrement';
import { type FieldWidgetRelationCardRecord } from '@/page-layout/widgets/field/types/FieldWidgetRelationCardRecord';
import { generateFieldWidgetInstanceId } from '@/page-layout/widgets/field/utils/generateFieldWidgetInstanceId';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { StyledWidgetContentContainer } from '@/ui/layout/components/WidgetContentContainer';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledShowMoreButtonContainer = styled.div`
  padding-top: ${themeCssVariables.spacing[2]};
`;

type FieldWidgetRelationRecordsCardProps = {
  fieldDefinition: FieldDefinition<
    FieldRelationMetadata | FieldMorphRelationMetadata
  >;
  relationRecords: FieldWidgetRelationCardRecord[];
  relationRecordsTotalCount?: number;
  seeAllHref?: string;
  isInSidePanel: boolean;
  isReadOnly?: boolean;
};

export const FieldWidgetRelationRecordsCard = ({
  fieldDefinition,
  relationRecords,
  relationRecordsTotalCount,
  seeAllHref,
  isInSidePanel,
  isReadOnly = false,
}: FieldWidgetRelationRecordsCardProps) => {
  const widget = useCurrentWidget();
  const navigate = useNavigate();

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

  const hasHiddenLoadedRecords = relationRecords.length > visibleItemsCount;

  const handleShowMore = () => {
    if (!hasHiddenLoadedRecords && isDefined(seeAllHref)) {
      navigate(seeAllHref);
      return;
    }

    setVisibleItemsCount(
      (prevCount) => prevCount + FIELD_WIDGET_RELATION_CARD_LOAD_MORE_INCREMENT,
    );
  };

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

  if (relationRecords.length === 0) {
    return null;
  }

  const visibleRelationRecords = relationRecords.slice(0, visibleItemsCount);
  // Nested relations are capped server-side, so the loaded records can undercount.
  const totalRecordsCount = Math.max(
    relationRecordsTotalCount ?? 0,
    relationRecords.length,
  );
  const remainingCount = totalRecordsCount - visibleRelationRecords.length;
  const hasMoreRecords =
    hasHiddenLoadedRecords || (remainingCount > 0 && isDefined(seeAllHref));

  return (
    <SidePanelProvider value={{ isInSidePanel }}>
      <RecordFieldsScopeContextProvider value={{ scopeInstanceId: instanceId }}>
        <FieldContext.Provider
          value={{
            recordId: targetRecord.id,
            isLabelIdentifier: false,
            fieldDefinition,
            useUpdateRecord: useUpdateOneObjectRecordMutation,
            isRecordFieldReadOnly: isReadOnly || isRecordFieldReadOnly,
          }}
        >
          <FieldInputEventContext.Provider value={{ onSubmit: handleSubmit }}>
            <StyledWidgetContentContainer>
              <RecordDetailRecordsListContainer>
                {visibleRelationRecords.map(
                  ({ record, objectNameSingular, fieldMetadataId }) => (
                    <Fragment
                      key={`${objectNameSingular}-${record.id}-${fieldMetadataId}`}
                    >
                      <RecordDetailRelationRecordsListItemEffect
                        relationRecordId={record.id}
                        relationObjectMetadataNameSingular={objectNameSingular}
                      />
                      <RecordDetailRelationRecordsListItem
                        isExpanded={expandedItem === record.id}
                        onClick={handleItemClick}
                        relationRecord={record}
                        relationObjectMetadataNameSingular={objectNameSingular}
                        relationFieldMetadataId={fieldMetadataId}
                      />
                    </Fragment>
                  ),
                )}
                {hasMoreRecords && (
                  <StyledShowMoreButtonContainer>
                    <FieldWidgetShowMoreButton
                      remainingCount={remainingCount}
                      onClick={handleShowMore}
                    />
                  </StyledShowMoreButtonContainer>
                )}
              </RecordDetailRecordsListContainer>
            </StyledWidgetContentContainer>
          </FieldInputEventContext.Provider>
        </FieldContext.Provider>
      </RecordFieldsScopeContextProvider>
    </SidePanelProvider>
  );
};
