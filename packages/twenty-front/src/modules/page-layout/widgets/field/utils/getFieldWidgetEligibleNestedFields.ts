import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldWidgetEligibleNestedField } from '@/page-layout/widgets/field/utils/isFieldWidgetEligibleNestedField';

export const getFieldWidgetEligibleNestedFields = (
  relationTargetObjectMetadataItem: EnrichedObjectMetadataItem,
): FieldMetadataItem[] =>
  relationTargetObjectMetadataItem.readableFields
    .filter(isFieldWidgetEligibleNestedField)
    .toSorted((fieldA, fieldB) => fieldA.label.localeCompare(fieldB.label));
