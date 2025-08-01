import {
  IsFieldReadOnlyByPermissionParams,
  isFieldReadOnlyByPermissions,
} from '@/object-record/record-field/hooks/read-only/utils/isFieldReadOnlyByPermissions';
import {
  IsFieldReadOnlyBySystemParams,
  isFieldReadOnlyBySystem,
} from '@/object-record/record-field/hooks/read-only/utils/isFieldReadOnlyBySystem';

export const isFieldReadOnly = ({
  objectPermissions,
  fieldMetadataId,
  objectNameSingular,
  fieldName,
  fieldType,
  isCustom,
}: IsFieldReadOnlyByPermissionParams & IsFieldReadOnlyBySystemParams) => {
  const fieldReadOnlyByPermissions = isFieldReadOnlyByPermissions({
    objectPermissions,
    fieldMetadataId,
  });

  const fieldReadOnlyBySystem = isFieldReadOnlyBySystem({
    objectNameSingular,
    fieldName,
    fieldType,
    isCustom,
  });

  return fieldReadOnlyByPermissions || fieldReadOnlyBySystem;
};
