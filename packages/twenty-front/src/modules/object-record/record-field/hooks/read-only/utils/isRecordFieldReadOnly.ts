import {
  IsFieldReadOnlyByPermissionParams,
  isFieldReadOnlyByPermissions,
} from '@/object-record/record-field/hooks/read-only/utils/internal/isFieldReadOnlyByPermissions';
import {
  IsFieldReadOnlyBySystemParams,
  isFieldReadOnlyBySystem,
} from '@/object-record/record-field/hooks/read-only/utils/internal/isFieldReadOnlyBySystem';

type IsRecordFieldReadOnlyParams = {
  isRecordReadOnly: boolean;
} & IsFieldReadOnlyByPermissionParams &
  IsFieldReadOnlyBySystemParams;

export const isRecordFieldReadOnly = ({
  isRecordReadOnly,
  objectPermissions,
  fieldMetadataId,
  objectNameSingular,
  fieldName,
  fieldType,
  isCustom,
}: IsRecordFieldReadOnlyParams) => {
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

  return (
    isRecordReadOnly || fieldReadOnlyByPermissions || fieldReadOnlyBySystem
  );
};
