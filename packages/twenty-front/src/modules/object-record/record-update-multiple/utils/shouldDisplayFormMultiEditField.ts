import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { shouldDisplayFormField } from '@/workflow/workflow-steps/workflow-actions/utils/shouldDisplayFormField';

export const shouldDisplayFormMultiEditField = (
  fieldMetadataItem: FieldMetadataItem,
) => {
  return (
    shouldDisplayFormField({
      fieldMetadataItem,
      actionType: 'UPDATE_RECORD',
    }) && !fieldMetadataItem.isUnique
  );
};
