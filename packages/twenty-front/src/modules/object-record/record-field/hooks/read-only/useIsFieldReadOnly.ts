import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { isFieldReadOnlyByPermissions } from '@/object-record/record-field/hooks/read-only/utils/isFieldReadOnlyByPermissions';
import {
  isFieldReadOnlyBySystem,
  IsFieldReadOnlyBySystemParams,
} from '@/object-record/record-field/hooks/read-only/utils/isFieldReadOnlyBySystem';
import { useMemo } from 'react';

export type UseFieldIsReadOnlyParams = {
  fieldMetadataId?: string;
  objectMetadataId: string;
} & IsFieldReadOnlyBySystemParams;

const useFieldIsReadOnlyByPermissions = ({
  fieldMetadataId,
  objectMetadataId,
}: {
  fieldMetadataId?: string;
  objectMetadataId: string;
}) => {
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  return useMemo(() => {
    if (!fieldMetadataId) {
      return false;
    }
    const objectPermissions = getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      objectMetadataId,
    );

    return isFieldReadOnlyByPermissions({
      objectPermissions,
      fieldMetadataId,
    });
  }, [objectPermissionsByObjectMetadataId, objectMetadataId, fieldMetadataId]);
};

export const useIsFieldReadOnly = ({
  fieldMetadataId,
  objectMetadataId,
  objectNameSingular,
  fieldName,
  fieldType,
  isCustom,
}: {
  objectMetadataId: string;
  fieldMetadataId?: string;
} & IsFieldReadOnlyBySystemParams) => {
  const fieldIsReadOnlyByPermissions = useFieldIsReadOnlyByPermissions({
    fieldMetadataId,
    objectMetadataId,
  });

  const fieldReadOnlyBySystem = isFieldReadOnlyBySystem({
    objectNameSingular,
    fieldName,
    fieldType,
    isCustom,
  });

  return fieldIsReadOnlyByPermissions || fieldReadOnlyBySystem;
};
