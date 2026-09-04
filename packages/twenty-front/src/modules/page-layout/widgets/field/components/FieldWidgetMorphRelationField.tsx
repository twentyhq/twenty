import { useGetMorphRelationRelatedRecordsWithObjectNameSingular } from '@/object-record/record-field-list/record-detail-section/relation/components/hooks/useGetMorphRelationRelatedRecordsWithObjectNameSingular';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMorphRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FieldWidgetRelationRecordChips } from '@/page-layout/widgets/field/components/FieldWidgetRelationRecordChips';

type FieldWidgetMorphRelationFieldProps = {
  fieldDefinition: FieldDefinition<FieldMorphRelationMetadata>;
  recordId: string;
  isInSidePanel: boolean;
};

export const FieldWidgetMorphRelationField = ({
  fieldDefinition,
  recordId,
  isInSidePanel,
}: FieldWidgetMorphRelationFieldProps) => {
  const recordsWithObjectNameSingular =
    useGetMorphRelationRelatedRecordsWithObjectNameSingular({
      recordId,
      morphRelations: fieldDefinition.metadata.morphRelations,
    });

  if (recordsWithObjectNameSingular.length === 0) {
    return null;
  }

  return (
    <FieldWidgetRelationRecordChips
      relationRecords={recordsWithObjectNameSingular.map((morphItem) => ({
        record: morphItem.value,
        objectNameSingular: morphItem.objectNameSingular,
      }))}
      isInSidePanel={isInSidePanel}
    />
  );
};
