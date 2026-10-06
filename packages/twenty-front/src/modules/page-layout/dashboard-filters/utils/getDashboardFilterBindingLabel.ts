import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// Reads "Company → Account Owner" for a one-hop binding, like the advanced filter labels its relation traversals.
export const getDashboardFilterBindingLabel = ({
  binding,
  objectMetadataItems,
}: {
  binding: DashboardFilterBinding;
  objectMetadataItems: Pick<EnrichedObjectMetadataItem, 'fields'>[];
}): string | undefined => {
  const fields = objectMetadataItems.flatMap(
    (objectMetadataItem) => objectMetadataItem.fields,
  );

  const boundField = fields.find(
    (field) => field.id === binding.fieldMetadataId,
  );

  if (!isDefined(boundField)) {
    return undefined;
  }

  if (!isDefined(binding.relationTargetFieldMetadataId)) {
    return boundField.label;
  }

  const relationTargetField = fields.find(
    (field) => field.id === binding.relationTargetFieldMetadataId,
  );

  return isDefined(relationTargetField)
    ? `${boundField.label} → ${relationTargetField.label}`
    : undefined;
};
