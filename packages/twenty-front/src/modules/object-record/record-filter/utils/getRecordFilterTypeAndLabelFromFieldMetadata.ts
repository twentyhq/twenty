import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isSystemSearchVectorField } from '@/object-record/utils/isSystemSearchVectorField';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';

export const getRecordFilterTypeAndLabelFromFieldMetadata = ({
  fieldMetadataId,
  relationTargetFieldMetadataId,
  fieldMetadataItems,
}: {
  fieldMetadataId: string;
  relationTargetFieldMetadataId?: string | null;
  fieldMetadataItems: FieldMetadataItem[];
}): Pick<RecordFilter, 'type' | 'label'> | undefined => {
  const sourceFieldMetadataItem = fieldMetadataItems.find(
    (fieldMetadataItem) => fieldMetadataItem.id === fieldMetadataId,
  );

  if (!isDefined(sourceFieldMetadataItem)) {
    return undefined;
  }

  const relationTargetFieldMetadataItem = isDefined(
    relationTargetFieldMetadataId,
  )
    ? fieldMetadataItems.find(
        (fieldMetadataItem) =>
          fieldMetadataItem.id === relationTargetFieldMetadataId,
      )
    : undefined;

  // A relation-traversal filter is meaningful only if both ends resolve,
  // otherwise its filterType and label would fall back to the relation
  // source while the dispatcher silently drops the GraphQL filter
  if (
    isDefined(relationTargetFieldMetadataId) &&
    !isDefined(relationTargetFieldMetadataItem)
  ) {
    return undefined;
  }

  const type = getFilterTypeFromFieldType(
    (relationTargetFieldMetadataItem ?? sourceFieldMetadataItem).type,
  );

  const label = isSystemSearchVectorField(sourceFieldMetadataItem.name)
    ? 'Search'
    : isDefined(relationTargetFieldMetadataItem)
      ? `${sourceFieldMetadataItem.label} → ${relationTargetFieldMetadataItem.label}`
      : sourceFieldMetadataItem.label;

  return { type, label };
};
