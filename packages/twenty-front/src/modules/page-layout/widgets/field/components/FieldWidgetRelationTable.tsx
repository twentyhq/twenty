import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordFilterValueDependenciesContext } from '@/object-record/record-filter/contexts/RecordFilterValueDependenciesContext';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { RecordTableWidgetRendererContent } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRendererContent';
import { getRelationTableFilter } from '@/page-layout/widgets/field/utils/getRelationTableFilter';
import { isFieldWidget } from '@/page-layout/widgets/field/utils/isFieldWidget';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
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

  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: relationObjectMetadataNameSingular,
    });

  const { objectMetadataItems } = useObjectMetadataItems();

  const recordObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === objectMetadataNameSingular,
  );

  const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
    ({ id }) => id === relationFieldMetadataId,
  );

  // Scope the table to the current record's related records, even when the
  // widget's viewId provides the columns. Without this, the viewId is rendered
  // as a global list and the relation is lost.
  const relationTableFilter = getRelationTableFilter({
    recordId,
    relationType,
    relationFieldMetadataItem,
    targetObjectMetadataNameSingular: recordObjectMetadataItem?.nameSingular,
    targetObjectMetadataNamePlural: recordObjectMetadataItem?.namePlural,
  });

  if (!isDefined(viewId) || !isDefined(relationObjectMetadataId)) {
    return null;
  }

  return (
    <RecordFilterValueDependenciesContext.Provider
      value={{ currentRecordId: recordId, relationTableFilter }}
    >
      <StyledContainer>
        <RecordTableWidgetRendererContent
          objectMetadataId={relationObjectMetadataId}
          viewId={viewId}
          widgetId={widget.id}
          isReadOnly={isPageLayoutInEditMode}
          isEmptyStateHidden
        />
      </StyledContainer>
    </RecordFilterValueDependenciesContext.Provider>
  );
};
