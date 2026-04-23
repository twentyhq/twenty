import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { shouldDisplayFormField } from '@/workflow/workflow-steps/workflow-actions/utils/shouldDisplayFormField';

export const shouldDisplayFormMultiEditField = (
  fieldMetadataItem: FieldMetadataItem,
) => {
  if (
    !shouldDisplayFormField({ fieldMetadataItem, actionType: 'UPDATE_RECORD' })
  ) {
    return false;
  }

  if (fieldMetadataItem.isUnique === true) {
    return false;
  }

  return true;
};
