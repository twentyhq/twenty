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

const StyledGroupHeading = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xxs};
  font-weight: ${themeCssVariables.font.weight.medium};
  letter-spacing: 0.05em;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]}
    ${themeCssVariables.spacing[1]};
  text-transform: uppercase;
`;

// Fork-specific override: when the junction-target is a morph, render each
// target-type as its own sub-section with an independent initial visible-items
// count. Falls back to FIELD_WIDGET_RELATION_CARD_INITIAL_VISIBLE_ITEMS for any
// target type not listed here.
const INITIAL_VISIBLE_PER_OBJECT_NAME: Record<string, number> = {
  person: 5,
  company: 3,
};

const getInitialVisibleForObject = (objectNameSingular: string): number =>
  INITIAL_VISIBLE_PER_OBJECT_NAME[objectNameSingular] ??
  FIELD_WIDGET_RELATION_CARD_INITIAL_VISIBLE_ITEMS;

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
  const [visibleItemsCountPerGroup, setVisibleItemsCountPerGroup] = useState<
    Record<string, number>
  >({});
  const targetRecord = useTargetRecord();

  const instanceId = generateFieldWidgetInstanceId({
    widgetId: widget.id,
    recordId: targetRecord.id,
    fieldName: fieldDefinition.metadata.fieldName,
    isInSidePanel,
  });

  const handleItemClick = (id: string) =>
    setExpandedItem(id === expandedItem ? '' : id);

  const getVisibleCountForGroup = (objectNameSingular: string) =>
    visibleItemsCountPerGroup[objectNameSingular] ??
    getInitialVisibleForObject(objectNameSingular);

  const handleShowMore = (objectNameSingular: string) => () => {
    setVisibleItemsCountPerGroup((prev) => ({
      ...prev,
      [objectNameSingular]:
        getVisibleCountForGroup(objectNameSingular) +
        FIELD_WIDGET_RELATION_CARD_LOAD_MORE_INCREMENT,
    }));
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

  // Determine the canonical variant order for grouping. For morph junctions,
  // use the morphRelations array on the target field so order is stable and
  // matches the field definition. For non-morph junctions, fall back to a
  // single derived variant — produces a single group with no heading.
  const targetField = junctionConfig.targetFields[0];
  const variantOrder: { nameSingular: string; labelPlural: string }[] =
    junctionConfig.isMorphRelation
      ? (targetField.morphRelations ?? []).map((morphRelation) => {
          const nameSingular = morphRelation.targetObjectMetadata.nameSingular;
          return {
            nameSingular,
            labelPlural:
              objectMetadataItems.find((o) => o.nameSingular === nameSingular)
                ?.labelPlural ?? nameSingular,
          };
        })
      : (() => {
          const distinctNames = Array.from(
            new Set(targetRecordsWithMetadata.map((r) => r.objectNameSingular)),
          );
          return distinctNames.map((nameSingular) => ({
            nameSingular,
            labelPlural:
              objectMetadataItems.find((o) => o.nameSingular === nameSingular)
                ?.labelPlural ?? nameSingular,
          }));
        })();

  const groups = variantOrder
    .map((variant) => {
      const all = targetRecordsWithMetadata.filter(
        (r) => r.objectNameSingular === variant.nameSingular,
      );
      const visibleCount = getVisibleCountForGroup(variant.nameSingular);
      const visible = all.slice(0, visibleCount);
      const remaining = all.length - visibleCount;
      return { ...variant, all, visible, remaining };
    })
    .filter((g) => g.all.length > 0);

  // Only render section headings if there is more than one target variant in
  // play — preserves the existing single-group UX for non-polymorphic junctions.
  const shouldShowHeadings = groups.length > 1;

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
              {groups.map((group) => (
                <Fragment key={group.nameSingular}>
                  {shouldShowHeadings && (
                    <StyledGroupHeading>{group.labelPlural}</StyledGroupHeading>
                  )}
                  {group.visible.map((item) => (
                    <Fragment key={item.record.id}>
                      <RecordDetailRelationRecordsListItemEffect
                        relationRecordId={item.record.id}
                        relationObjectMetadataNameSingular={
                          item.objectNameSingular
                        }
                      />
                      <RecordDetailRelationRecordsListItem
                        isExpanded={expandedItem === item.record.id}
                        onClick={handleItemClick}
                        relationRecord={item.record}
                        relationObjectMetadataNameSingular={
                          item.objectNameSingular
                        }
                        relationFieldMetadataId=""
                      />
                    </Fragment>
                  ))}
                  {group.remaining > 0 && (
                    <StyledShowMoreButtonContainer>
                      <FieldWidgetShowMoreButton
                        remainingCount={group.remaining}
                        onClick={handleShowMore(group.nameSingular)}
                      />
                    </StyledShowMoreButtonContainer>
                  )}
                </Fragment>
              ))}
            </RecordDetailRecordsListContainer>
          </FieldInputEventContext.Provider>
        </FieldContext.Provider>
      </RecordFieldsScopeContextProvider>
    </SidePanelProvider>
  );
};
