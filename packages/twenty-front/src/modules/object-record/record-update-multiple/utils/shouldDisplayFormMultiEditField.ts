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

  // Unlike a workflow action, multi-edit is a UI editing surface, so it honours
  // the field's UI-editability on top of what an automation is allowed to write
  if ((fieldMetadataItem.isUIEditable ?? true) === false) {
    return false;
  }

  if (fieldMetadataItem.isUnique === true) {
    return false;
  }

  return true;
};
