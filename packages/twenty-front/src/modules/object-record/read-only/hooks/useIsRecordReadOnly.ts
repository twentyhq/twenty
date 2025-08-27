import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { isRecordReadOnly } from '@/object-record/read-only/utils/isRecordReadOnly';
import { useIsRecordDeleted } from '@/object-record/record-field/ui/hooks/useIsRecordDeleted';

type UseIsRecordReadOnlyParams = {
  recordId: string;
  objectMetadataId: string;
};

export const useIsRecordReadOnly = ({
  recordId,
  objectMetadataId,
}: UseIsRecordReadOnlyParams) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const objectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    objectMetadataId,
  );

  const isRecordDeleted = useIsRecordDeleted({ recordId });

  return isRecordReadOnly({
    objectPermissions,
    isRecordDeleted,
    objectMetadataItem,
  });
};
