import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { getFieldLabelWithSubField } from '@/side-panel/pages/page-layout/utils/getFieldLabelWithSubField';
import { getRelationFieldLabel } from '@/side-panel/pages/page-layout/utils/getRelationFieldLabel';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getDashboardFilterBindingLabel = ({
  binding,
  objectMetadataItems,
}: {
  binding: DashboardFilterBinding;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): string => {
  const { fieldMetadataItem } = getFieldMetadataItemById({
    fieldMetadataId: binding.fieldMetadataId,
    objectMetadataItems,
  });

  if (
    isDefined(binding.relationTargetFieldMetadataId) &&
    isDefined(fieldMetadataItem)
  ) {
    const { fieldMetadataItem: relationTargetFieldMetadataItem } =
      getFieldMetadataItemById({
        fieldMetadataId: binding.relationTargetFieldMetadataId,
        objectMetadataItems,
      });

    if (isDefined(relationTargetFieldMetadataItem)) {
      return getRelationFieldLabel(
        fieldMetadataItem,
        relationTargetFieldMetadataItem.name,
        objectMetadataItems,
      );
    }
  }

  return getFieldLabelWithSubField({
    field: fieldMetadataItem,
    subFieldName: binding.subFieldName ?? undefined,
    objectMetadataItems,
  });
};
