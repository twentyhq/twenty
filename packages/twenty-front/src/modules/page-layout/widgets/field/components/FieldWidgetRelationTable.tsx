import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordFilterValueDependenciesContext } from '@/object-record/record-filter/contexts/RecordFilterValueDependenciesContext';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ValidResolvedJunctionConfig } from '@/object-record/record-field/ui/utils/junction/types/ValidResolvedJunctionConfig';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { StyledWidgetTableOutline } from '@/page-layout/widgets/components/WidgetContentFrame';
import { RecordTableWidgetRendererContent } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRendererContent';
import { getFieldWidgetJunctionCreateThrough } from '@/page-layout/widgets/field/utils/getFieldWidgetJunctionCreateThrough';
import { getFieldWidgetNestedRelationCreateThrough } from '@/page-layout/widgets/field/utils/getFieldWidgetNestedRelationCreateThrough';
import { isFieldWidget } from '@/page-layout/widgets/field/utils/isFieldWidget';
import { resolveFieldWidgetNestedRelation } from '@/page-layout/widgets/field/utils/resolveFieldWidgetNestedRelation';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useViewById } from '@/views/hooks/useViewById';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useMemo } from 'react';
import {
  computeRelationGqlFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

const FIELD_WIDGET_RELATION_TABLE_MAX_VISIBLE_RECORDS = 20;

const FIELD_WIDGET_RELATION_TABLE_MAX_HEIGHT_IN_PX =
  (FIELD_WIDGET_RELATION_TABLE_MAX_VISIBLE_RECORDS + 2) *
  RECORD_TABLE_ROW_HEIGHT;

const StyledContainer = styled(StyledWidgetTableOutline)`
  max-height: ${FIELD_WIDGET_RELATION_TABLE_MAX_HEIGHT_IN_PX}px;
`;

type FieldWidgetRelationTableProps = {
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
  recordId: string;
  junctionConfig?: ValidResolvedJunctionConfig;
};

export const FieldWidgetRelationTable = ({
  fieldDefinition,
  recordId,
  junctionConfig,
}: FieldWidgetRelationTableProps) => {
  const widget = useCurrentWidget();

  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';

  const { objectMetadataItems } = useObjectMetadataItems();

  const viewId = isFieldWidget(widget)
    ? widget.configuration.viewId
    : undefined;
  // Record page relation widget content defaults to editable, unlike dashboards.
  const isUIEditable = isFieldWidget(widget)
    ? (widget.configuration.isUIEditable ?? true)
    : true;
  const nestedRelationFieldMetadataId = isFieldWidget(widget)
    ? widget.configuration.nestedRelationFieldMetadataId
    : undefined;

  const relationObjectMetadataId =
    fieldDefinition.metadata.relationObjectMetadataId;
  const recordPageObjectMetadataNameSingular =
    fieldDefinition.metadata.objectMetadataNameSingular;

  const { view: persistedView } = useViewById(viewId ?? null);

  // Memoized so the derived picker parameters below keep a stable identity
  // and do not churn the widget provider's context value on every render.
  const resolvedNestedRelation = useMemo(
    () =>
      resolveFieldWidgetNestedRelation({
        objectMetadataItems,
        relationTargetObjectMetadataId: relationObjectMetadataId,
        nestedRelationFieldMetadataId,
      }),
    [
      objectMetadataItems,
      relationObjectMetadataId,
      nestedRelationFieldMetadataId,
    ],
  );

  // A junction widget lists the records behind the junction, like the card
  // and field display modes. A morph junction has no single object to list,
  // and a view saved on the junction object predates junction traversal, so
  // both keep listing the junction records their view was built for.
  const junctionTargetObjectMetadataId =
    isDefined(junctionConfig) && !junctionConfig.isMorphRelation
      ? junctionConfig.targetFields[0]?.relation?.targetObjectMetadata.id
      : undefined;

  const isPersistedViewOnJunctionObject =
    persistedView?.objectMetadataId === relationObjectMetadataId;

  const junctionTableObjectMetadataId = isPersistedViewOnJunctionObject
    ? relationObjectMetadataId
    : junctionTargetObjectMetadataId;

  const isJunctionTable =
    isDefined(junctionTableObjectMetadataId) &&
    junctionTableObjectMetadataId === junctionTargetObjectMetadataId;

  // A widget with a broken nested relation (deleted or deactivated second hop)
  // resolves to no object and so renders nothing, rather than falling back to
  // the first hop's records and silently showing a different object than the
  // widget title claims. Likewise a persisted view listing yet another object
  // belongs to a previous relation chain and must not be rendered under this
  // one.
  const directTableObjectMetadataId =
    junctionTableObjectMetadataId ?? relationObjectMetadataId;

  const isPersistedViewOnAnotherObject =
    isDefined(persistedView) &&
    persistedView.objectMetadataId !== directTableObjectMetadataId;

  const getTableObjectMetadataId = () => {
    if (isDefined(nestedRelationFieldMetadataId)) {
      return resolvedNestedRelation?.nestedRelationTargetObjectMetadataItem.id;
    }

    if (isPersistedViewOnAnotherObject) {
      return undefined;
    }

    return directTableObjectMetadataId;
  };

  const tableObjectMetadataId = getTableObjectMetadataId();

  const {
    targetFieldMetadataName,
    relationObjectMetadataNameSingular,
    relationType,
    fieldName,
  } = fieldDefinition.metadata;

  const nestedRelationCreateThrough = useMemo(
    () =>
      isDefined(resolvedNestedRelation)
        ? getFieldWidgetNestedRelationCreateThrough({
            fieldRelationMetadata: {
              targetFieldMetadataName,
              relationObjectMetadataNameSingular,
              relationType,
            },
            nestedRelationFieldMetadataItem:
              resolvedNestedRelation.nestedRelationFieldMetadataItem,
            recordId,
          })
        : undefined,
    [
      resolvedNestedRelation,
      targetFieldMetadataName,
      relationObjectMetadataNameSingular,
      relationType,
      recordId,
    ],
  );

  const junctionCreateThrough = useMemo(() => {
    const sourceObjectMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.nameSingular ===
        recordPageObjectMetadataNameSingular,
    );

    return isDefined(junctionConfig) &&
      isJunctionTable &&
      isDefined(sourceObjectMetadataItem)
      ? getFieldWidgetJunctionCreateThrough({
          junctionConfig,
          sourceObjectMetadataItem,
          objectMetadataItems,
          recordId,
        })
      : undefined;
  }, [
    junctionConfig,
    isJunctionTable,
    objectMetadataItems,
    recordPageObjectMetadataNameSingular,
    recordId,
  ]);

  // A many-to-one first hop points at a single intermediate record, so the
  // terminal view is scoped directly by it: the intermediate becomes the
  // filter's current record, read from the current record's join column.
  const isManyToOneNestedChain =
    isDefined(nestedRelationFieldMetadataId) &&
    relationType === RelationType.MANY_TO_ONE;

  const intermediateRecordId = useAtomFamilySelectorValue(
    recordStoreFamilySelector,
    {
      recordId,
      fieldName: computeRelationGqlFieldJoinColumnName({ name: fieldName }),
    },
  );

  const filterCurrentRecord = useMemo(() => {
    if (!isManyToOneNestedChain) {
      return isDefined(recordPageObjectMetadataNameSingular)
        ? {
            id: recordId,
            objectMetadataNameSingular: recordPageObjectMetadataNameSingular,
          }
        : undefined;
    }

    return isNonEmptyString(intermediateRecordId)
      ? {
          id: intermediateRecordId,
          objectMetadataNameSingular: relationObjectMetadataNameSingular,
        }
      : undefined;
  }, [
    isManyToOneNestedChain,
    recordId,
    recordPageObjectMetadataNameSingular,
    intermediateRecordId,
    relationObjectMetadataNameSingular,
  ]);

  if (
    !isDefined(viewId) ||
    !isDefined(tableObjectMetadataId) ||
    !isDefined(recordPageObjectMetadataNameSingular) ||
    !isDefined(filterCurrentRecord)
  ) {
    return null;
  }

  return (
    <RecordFilterValueDependenciesContext.Provider
      value={{
        currentRecord: filterCurrentRecord,
      }}
    >
      <StyledContainer>
        <RecordTableWidgetRendererContent
          objectMetadataId={tableObjectMetadataId}
          viewId={viewId}
          widgetId={widget.id}
          isUIEditable={!isPageLayoutInEditMode && isUIEditable}
          isEmptyStateHidden
          instanceIdSuffix={`${recordId}${isInSidePanel ? '-side-panel' : ''}`}
          nestedRelationCreateThrough={nestedRelationCreateThrough}
          junctionCreateThrough={junctionCreateThrough}
        />
      </StyledContainer>
    </RecordFilterValueDependenciesContext.Provider>
  );
};
