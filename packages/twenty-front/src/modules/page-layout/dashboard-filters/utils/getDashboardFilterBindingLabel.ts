import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { getFieldLabelWithSubField } from '@/side-panel/pages/page-layout/utils/getFieldLabelWithSubField';
import { getRelationFieldLabel } from '@/side-panel/pages/page-layout/utils/getRelationFieldLabel';
import { t } from '@lingui/core/macro';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const ID_FIELD_NAME = 'id';

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

  // Bound through its own id, the chart filters its records themselves, which is what the picker calls it too.
  if (
    isDefined(fieldMetadataItem) &&
    fieldMetadataItem.name === ID_FIELD_NAME &&
    fieldMetadataItem.type === FieldMetadataType.UUID &&
    !isDefined(binding.relationTargetFieldMetadataId)
  ) {
    return t`Record`;
  }

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
