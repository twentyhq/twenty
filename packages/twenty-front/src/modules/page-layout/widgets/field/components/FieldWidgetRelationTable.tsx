import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordFilterValueDependenciesContext } from '@/object-record/record-filter/contexts/RecordFilterValueDependenciesContext';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { RecordTableWidgetRendererContent } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRendererContent';
import { getFieldWidgetNestedRelationCreateThrough } from '@/page-layout/widgets/field/utils/getFieldWidgetNestedRelationCreateThrough';
import { isFieldWidget } from '@/page-layout/widgets/field/utils/isFieldWidget';
import { resolveFieldWidgetNestedRelation } from '@/page-layout/widgets/field/utils/resolveFieldWidgetNestedRelation';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
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

const StyledContainer = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  max-height: calc(
    ${FIELD_WIDGET_RELATION_TABLE_MAX_HEIGHT_IN_PX}px * var(--t-scale, 1)
  );
  min-height: 0;
  overflow: hidden;
`;

type FieldWidgetRelationTableProps = {
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
  recordId: string;
};

export const FieldWidgetRelationTable = ({
  fieldDefinition,
  recordId,
}: FieldWidgetRelationTableProps) => {
  const widget = useCurrentWidget();

  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const { isInSidePanel } = useLayoutRenderingContext();

  const { objectMetadataItems } = useObjectMetadataItems();

  const viewId = isFieldWidget(widget)
    ? widget.configuration.viewId
    : undefined;
  const nestedRelationFieldMetadataId = isFieldWidget(widget)
    ? widget.configuration.nestedRelationFieldMetadataId
    : undefined;

  const relationObjectMetadataId =
    fieldDefinition.metadata.relationObjectMetadataId;
  const recordPageObjectMetadataNameSingular =
    fieldDefinition.metadata.objectMetadataNameSingular;

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

  // A widget with a broken nested relation (deleted or deactivated second hop)
  // resolves to no object and so renders nothing, rather than falling back to
  // the first hop's records and silently showing a different object than the
  // widget title claims.
  const tableObjectMetadataId = isDefined(nestedRelationFieldMetadataId)
    ? resolvedNestedRelation?.nestedRelationTargetObjectMetadataItem.id
    : relationObjectMetadataId;

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
          isReadOnly={isPageLayoutInEditMode}
          isEmptyStateHidden
          instanceIdSuffix={`${recordId}${isInSidePanel ? '-side-panel' : ''}`}
          nestedRelationCreateThrough={nestedRelationCreateThrough}
        />
      </StyledContainer>
    </RecordFilterValueDependenciesContext.Provider>
  );
};
