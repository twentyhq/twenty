import { RecordFilterValueDependenciesContext } from '@/object-record/record-filter/contexts/RecordFilterValueDependenciesContext';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { RecordTableWidgetRendererContent } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRendererContent';
import { getRelationTableFilter } from '@/page-layout/widgets/field/utils/getRelationTableFilter';
import { isFieldWidget } from '@/page-layout/widgets/field/utils/isFieldWidget';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

const FIELD_WIDGET_RELATION_TABLE_MAX_VISIBLE_RECORDS = 20;

const FIELD_WIDGET_RELATION_TABLE_MAX_HEIGHT_IN_PX =
  (FIELD_WIDGET_RELATION_TABLE_MAX_VISIBLE_RECORDS + 2) *
  RECORD_TABLE_ROW_HEIGHT;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-height: ${FIELD_WIDGET_RELATION_TABLE_MAX_HEIGHT_IN_PX}px;
  min-height: 0;
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

  const viewId = isFieldWidget(widget)
    ? widget.configuration.viewId
    : undefined;

  const {
    relationFieldMetadataId,
    relationObjectMetadataNameSingular,
    relationObjectMetadataId,
    relationType,
    objectMetadataNameSingular,
  } = fieldDefinition.metadata;
  const recordPageObjectMetadataNameSingular =
    fieldDefinition.metadata.objectMetadataNameSingular;

  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: relationObjectMetadataNameSingular,
    });

  const { objectMetadataItems } = useObjectMetadataItems();

  const recordObjectMetadataItem = objectMetadataItems.find(
    ({ nameSingular }) => nameSingular === objectMetadataNameSingular,
  );

  const inverseRelationFieldMetadataItem =
    relationObjectMetadataItem.fields.find(
      ({ id }) => id === relationFieldMetadataId,
    );

  const relationTableFilter = getRelationTableFilter({
    recordId,
    relationType,
    inverseRelationFieldMetadataItem,
    recordObjectMetadataNameSingular: recordObjectMetadataItem?.nameSingular,
    recordObjectMetadataNamePlural: recordObjectMetadataItem?.namePlural,
  });

  if (
    !isDefined(viewId) ||
    !isDefined(relationObjectMetadataId) ||
    !isDefined(recordPageObjectMetadataNameSingular)
  ) {
    return null;
  }

  return (
    <RecordFilterValueDependenciesContext.Provider
      value={{
        currentRecord: {
          id: recordId,
          objectMetadataNameSingular: recordPageObjectMetadataNameSingular,
        },
        relationTableFilter,
      }}
    >
      <StyledContainer>
        <RecordTableWidgetRendererContent
          objectMetadataId={relationObjectMetadataId}
          viewId={viewId}
          widgetId={widget.id}
          isReadOnly={isPageLayoutInEditMode}
          isEmptyStateHidden
          instanceIdSuffix={`${recordId}${isInSidePanel ? '-side-panel' : ''}`}
        />
      </StyledContainer>
    </RecordFilterValueDependenciesContext.Provider>
  );
};
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
