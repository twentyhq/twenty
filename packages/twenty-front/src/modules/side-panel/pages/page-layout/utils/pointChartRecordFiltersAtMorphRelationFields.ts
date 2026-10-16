import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export const pointChartRecordFiltersAtMorphRelationFields = ({
  recordFilters,
  fieldMetadataItems,
}: {
  recordFilters: RecordFilter[];
  fieldMetadataItems: (Pick<FieldMetadataItem, 'id'> & {
    morphRelations?: { sourceFieldMetadata: { id: string } }[] | null;
  })[];
}): RecordFilter[] => {
  const fieldMetadataIdByMorphRelationTargetId = new Map(
    fieldMetadataItems.flatMap((fieldMetadataItem) =>
      (fieldMetadataItem.morphRelations ?? []).map(
        ({ sourceFieldMetadata }) =>
          [sourceFieldMetadata.id, fieldMetadataItem.id] as const,
      ),
    ),
  );

  return recordFilters.map((recordFilter) => ({
    ...recordFilter,
    fieldMetadataId:
      fieldMetadataIdByMorphRelationTargetId.get(
        recordFilter.fieldMetadataId,
      ) ?? recordFilter.fieldMetadataId,
  }));
};
