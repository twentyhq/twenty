import {
  isFieldReadOnlyBySystem,
  IsFieldReadOnlyBySystemParams,
} from '@/object-record/record-field/utils/isFieldReadOnlyBySystem';
import {
  IsFieldReadOnlyByPermissionsParams,
  useFieldIsReadOnlyByPermissions,
} from './useIsFieldReadOnlyByPermissions';

export const useFieldIsReadOnly = ({
  fieldMetadataId,
  objectMetadataId,
  objectNameSingular,
  fieldName,
  fieldType,
  isCustom,
}: IsFieldReadOnlyByPermissionsParams & IsFieldReadOnlyBySystemParams) => {
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
