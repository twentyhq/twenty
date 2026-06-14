import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';

export type UseFieldIsReadOnlyParams = {
  fieldMetadataId: string;
  objectMetadataId: string;
  recordId: string;
};

export const useIsRecordFieldReadOnly = ({
  fieldMetadataId,
  objectMetadataId,
  recordId,
}: UseFieldIsReadOnlyParams) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const fieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === fieldMetadataId,
  );

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const objectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    objectMetadataId,
  );

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId,
    objectMetadataId,
  });

  if (!fieldMetadataItem) {
    return false;
  }

  const fieldDefinition = formatFieldMetadataItemAsFieldDefinition({
    field: fieldMetadataItem,
    objectMetadataItem,
  });

  return isRecordFieldReadOnly({
    isRecordReadOnly,
    isSystemObject: objectMetadataItem.isSystem,
    objectPermissions,
    fieldMetadataItem,
    fieldDefinition,
    objectPermissionsByObjectMetadataId,
  });
};
