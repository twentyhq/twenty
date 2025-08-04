import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { isRecordReadOnly } from '@/object-record/record-field/hooks/read-only/utils/isRecordReadOnly';
import { useIsRecordDeleted } from '@/object-record/record-field/hooks/useIsRecordDeleted';

type UseIsRecordReadOnlyParams = {
  recordId: string;
  objectMetadataId: string;
};

export const useIsRecordReadOnly = ({
  recordId,
  objectMetadataId,
}: UseIsRecordReadOnlyParams) => {
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const objectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    objectMetadataId,
  );

  const isRecordDeleted = useIsRecordDeleted({ recordId });

  return isRecordReadOnly({
    objectPermissions,
    isRecordDeleted,
  });
};
