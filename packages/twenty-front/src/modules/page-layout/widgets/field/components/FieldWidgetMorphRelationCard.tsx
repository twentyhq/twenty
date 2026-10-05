import { useGetMorphRelationRelatedRecordsWithObjectNameSingular } from '@/object-record/record-field-list/record-detail-section/relation/components/hooks/useGetMorphRelationRelatedRecordsWithObjectNameSingular';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMorphRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FieldWidgetRelationRecordsCard } from '@/page-layout/widgets/field/components/FieldWidgetRelationRecordsCard';
import { isDefined } from 'twenty-shared/utils';

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
  const recordsWithObjectNameSingular =
    useGetMorphRelationRelatedRecordsWithObjectNameSingular({
      recordId,
      morphRelations: fieldDefinition.metadata.morphRelations,
    });

  return (
    <FieldWidgetRelationRecordsCard
      fieldDefinition={fieldDefinition}
      relationRecords={recordsWithObjectNameSingular
        .filter((item) => isDefined(item.value))
        .map((item) => ({
          record: item.value,
          objectNameSingular: item.objectNameSingular,
          fieldMetadataId: item.fieldMetadataId,
        }))}
      isInSidePanel={isInSidePanel}
    />
  );
};
