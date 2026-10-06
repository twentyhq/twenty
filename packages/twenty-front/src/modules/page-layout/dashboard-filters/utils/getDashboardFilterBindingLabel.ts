import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import {
  type CompositeFieldSubFieldName,
  type DashboardFilterBinding,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// The server accepts a composite sub-field on either end of a binding, so the label names it the way the filter chips do.
const getFieldLabelWithSubField = (
  field: FieldMetadataItem,
  subFieldName: CompositeFieldSubFieldName | null | undefined,
): string => {
  if (!isDefined(subFieldName) || !isCompositeFieldType(field.type)) {
    return field.label;
  }

  const subFieldLabel = getCompositeSubFieldLabel(field.type, subFieldName);

  return subFieldLabel === '' ? field.label : `${field.label} ${subFieldLabel}`;
};

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
    return getFieldLabelWithSubField(boundField, binding.subFieldName);
  }

  const relationTargetField = fields.find(
    (field) => field.id === binding.relationTargetFieldMetadataId,
  );

  return isDefined(relationTargetField)
    ? `${boundField.label} → ${getFieldLabelWithSubField(relationTargetField, binding.subFieldName)}`
    : undefined;
};
