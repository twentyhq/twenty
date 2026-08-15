import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Fragment, useCallback, useState } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isRecordReadOnly } from '@/object-record/read-only/utils/isRecordReadOnly';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { RecordDetailRecordsListContainer } from '@/object-record/record-field-list/record-detail-section/components/RecordDetailRecordsListContainer';
import { RecordDetailMorphRelationSectionDropdown } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailMorphRelationSectionDropdown';
import { RecordDetailRelationRecordsListItem } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationRecordsListItem';
import { RecordDetailRelationRecordsListItemEffect } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationRecordsListItemEffect';
import { useGetMorphRelationRelatedRecordsWithObjectNameSingular } from '@/object-record/record-field-list/record-detail-section/relation/components/hooks/useGetMorphRelationRelatedRecordsWithObjectNameSingular';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import {
  FieldInputEventContext,
  type FieldInputEvent,
} from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useIsRecordDeleted } from '@/object-record/record-field/ui/hooks/useIsRecordDeleted';
import { usePersistField } from '@/object-record/record-field/ui/hooks/usePersistField';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMorphRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getRecordFieldCardRelationPickerDropdownId } from '@/object-record/record-show/utils/getRecordFieldCardRelationPickerDropdownId';
import { FieldWidgetShowMoreButton } from '@/page-layout/widgets/field/components/FieldWidgetShowMoreButton';
import { FIELD_WIDGET_RELATION_CARD_INITIAL_VISIBLE_ITEMS } from '@/page-layout/widgets/field/constants/FieldWidgetRelationCardInitialVisibleItems';
import { FIELD_WIDGET_RELATION_CARD_LOAD_MORE_INCREMENT } from '@/page-layout/widgets/field/constants/FieldWidgetRelationCardLoadMoreIncrement';
import { generateFieldWidgetInstanceId } from '@/page-layout/widgets/field/utils/generateFieldWidgetInstanceId';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { usePublishWidgetHeaderInfo } from '@/page-layout/widgets/hooks/usePublishWidgetHeaderInfo';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { RelationType } from '~/generated-metadata/graphql';

const StyledShowMoreButtonContainer = styled.div`
  padding-top: ${themeCssVariables.spacing[2]};
`;

type FieldWidgetMorphRelationCardProps = {
  fieldDefinition: FieldDefinition<FieldMorphRelationMetadata>;
  recordId: string;
  isInSidePanel: boolean;
};

export const FieldWidgetMorphRelationCard = ({
  fieldDefinition,
  recordId,
  isInSidePanel,
}: FieldWidgetMorphRelationCardProps) => {
  const { t } = useLingui();
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

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

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

  const isToOneObject =
    fieldMetadata.relationType === RelationType.MANY_TO_ONE;

  const isRecordReadOnlyFromSourcePerspective = useIsRecordReadOnly({
    recordId: targetRecord.id,
    objectMetadataId: objectMetadataItem.id,
  });

  const relatedObjectMetadataItems = fieldMetadata.morphRelations
    .map((morphRelation) => morphRelation.targetObjectMetadata.id)
    .map((objectMetadataId) =>
      objectMetadataItems.find(
        (objectMetadataItemToFind) =>
          objectMetadataItemToFind.id === objectMetadataId,
      ),
    )
    .filter(isDefined);

  const isDeleted = useIsRecordDeleted({ recordId: targetRecord.id });

  const isRecordReadOnlyFromTargetPerspective =
    relatedObjectMetadataItems.some((relatedObjectMetadataItem) => {
      const objectPermissions = getObjectPermissionsFromMapByObjectMetadataId({
        objectPermissionsByObjectMetadataId,
        objectMetadataId: relatedObjectMetadataItem.id,
      });

      return isRecordReadOnly({
        objectPermissions,
        isRecordDeleted: isDeleted,
        objectMetadataItem: relatedObjectMetadataItem,
      });
    });

  const isRecordReadOnlyFromRelatedRecordPerspective = isToOneObject
    ? isRecordReadOnlyFromSourcePerspective
    : isRecordReadOnlyFromTargetPerspective;

  const isReadOnly =
    isRecordFieldReadOnly || isRecordReadOnlyFromRelatedRecordPerspective;

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

  const dropdownId = getRecordFieldCardRelationPickerDropdownId({
    fieldDefinition,
    recordId: targetRecord.id,
    instanceId,
  });

  const { openDropdown } = useOpenDropdown();

  const handleOpenDropdown = useCallback(() => {
    openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
  }, [openDropdown, dropdownId]);

  usePublishWidgetHeaderInfo({
    count: validRecords.length,
    primaryAction: isReadOnly
      ? undefined
      : {
          Icon: IconPlus,
          label: t`Add ${fieldDefinition.label}`,
          onClick: handleOpenDropdown,
        },
  });

  const visibleRecords = validRecords.slice(0, visibleItemsCount);
  const remainingCount = validRecords.length - visibleItemsCount;
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
            isRecordFieldReadOnly: isReadOnly,
          }}
        >
          <FieldInputEventContext.Provider value={{ onSubmit: handleSubmit }}>
            {validRecords.length > 0 && (
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
            )}
            <RecordDetailMorphRelationSectionDropdown loading={false} />
          </FieldInputEventContext.Provider>
        </FieldContext.Provider>
      </RecordFieldsScopeContextProvider>
    </SidePanelProvider>
  );
};
