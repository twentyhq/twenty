import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsRecordReadOnly } from '@/object-record/record-field/hooks/read-only/useIsRecordReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/record-field/hooks/read-only/utils/isRecordFieldReadOnly';

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

  if (!fieldMetadataItem) {
    throw new Error(
      `Could not load read only property for field ${fieldMetadataId}`,
    );
  }

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const objectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    objectMetadataId,
  );

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId,
    objectMetadataId,
  });

  return isRecordFieldReadOnly({
    isRecordReadOnly,
    objectPermissions,
    fieldMetadataId,
    objectNameSingular: objectMetadataItem.nameSingular,
    fieldName: fieldMetadataItem.name,
    fieldType: fieldMetadataItem.type,
    isCustom: fieldMetadataItem.isCustom ?? false,
  });
};
