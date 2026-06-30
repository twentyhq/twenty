import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export const findChartGroupByFieldMetadataItem = ({
  fields,
  fieldMetadataId,
}: {
  fields: FieldMetadataItem[] | undefined;
  fieldMetadataId: string;
}): FieldMetadataItem | undefined =>
  fields?.find(
    (field) =>
      field.id === fieldMetadataId ||
      (field.morphRelations ?? []).some(
        (morphRelation) =>
          morphRelation.sourceFieldMetadata.id === fieldMetadataId,
      ),
  );
