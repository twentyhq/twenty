import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useMemo } from 'react';
import { ObjectPermission } from '~/generated/graphql';

export type IsFieldReadOnlyByPermissionsParams = {
  fieldMetadataId?: string;
  objectMetadataId?: string;
};

export const fieldIsReadOnlyByPermissions = ({
  objectPermissions,
  fieldMetadataId,
}: {
  objectPermissions: ObjectPermission;
  fieldMetadataId?: string;
}) => {
  if (!fieldMetadataId || objectPermissions.canUpdateObjectRecords === false) {
    return !objectPermissions.canUpdateObjectRecords;
  }

  const fieldMetadataIsRestrictedForUpdate =
    objectPermissions.restrictedFields[fieldMetadataId]?.canUpdate === false;

  return fieldMetadataIsRestrictedForUpdate;
};

export const useFieldIsReadOnlyByPermissions = ({
  fieldMetadataId,
  objectMetadataId,
}: IsFieldReadOnlyByPermissionsParams) => {
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  return useMemo(() => {
    if (!fieldMetadataId || !objectMetadataId) {
      return false;
    }
    const objectPermissions = getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      objectMetadataId,
    );

    return fieldIsReadOnlyByPermissions({
      objectPermissions,
      fieldMetadataId,
    });
  }, [objectPermissionsByObjectMetadataId, objectMetadataId, fieldMetadataId]);
};
