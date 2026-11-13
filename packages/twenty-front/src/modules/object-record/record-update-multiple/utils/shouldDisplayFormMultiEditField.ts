import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFieldPermissions } from '@/object-metadata/utils/getFieldPermissions';
import { shouldDisplayFormField } from '@/workflow/workflow-steps/workflow-actions/utils/shouldDisplayFormField';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';

export const shouldDisplayFormMultiEditField = (
  fieldMetadataItem: FieldMetadataItem,
  objectPermissions?: Pick<ObjectRecordsPermissions, 'restrictedFields'>,
) => {
  if (
    !shouldDisplayFormField({ fieldMetadataItem, actionType: 'UPDATE_RECORD' })
  ) {
    return false;
  }

  if (fieldMetadataItem.isUnique === true) {
    return false;
  }

  if (objectPermissions) {
    const { canUpdateField, canReadField } = getFieldPermissions({
      objectPermissions,
      fieldMetadataId: fieldMetadataItem.id,
    });

    if (!canUpdateField || !canReadField) {
      return false;
    }
  }

  return true;
};
