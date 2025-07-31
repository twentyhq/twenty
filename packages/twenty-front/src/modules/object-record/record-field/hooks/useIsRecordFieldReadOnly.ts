import {
  IsFieldReadOnlyByPermissionsParams,
  useFieldIsReadOnlyByPermissions,
} from '@/object-record/record-field/hooks/useIsFieldReadOnlyByPermissions';
import { useIsRecordDeleted } from '@/object-record/record-field/hooks/useIsRecordDeleted';
import {
  isFieldReadOnlyBySystem,
  IsFieldReadOnlyBySystemParams,
} from '@/object-record/record-field/utils/isFieldReadOnlyBySystem';

export const isRecordFieldReadOnly = ({
  isRecordDeleted,
  isFieldReadOnlyByPermissions,
  isFieldReadOnlyBySystem,
}: {
  isRecordDeleted?: boolean;
  isFieldReadOnlyByPermissions?: boolean;
  isFieldReadOnlyBySystem?: boolean;
}) => {
  return (
    (isRecordDeleted ||
      isFieldReadOnlyByPermissions ||
      isFieldReadOnlyBySystem) ??
    false
  );
};

export const useIsRecordFieldReadOnly = ({
  recordId,
  fieldMetadataId,
  objectMetadataId,
  objectNameSingular,
  fieldName,
  fieldType,
  isCustom,
}: IsFieldReadOnlyByPermissionsParams &
  IsFieldReadOnlyBySystemParams & { recordId: string }) => {
  const isRecordDeleted = useIsRecordDeleted({ recordId });

  const isFieldReadOnlyByPermissions = useFieldIsReadOnlyByPermissions({
    fieldMetadataId,
    objectMetadataId,
  });

  const fieldReadOnlyBySystem = isFieldReadOnlyBySystem({
    objectNameSingular,
    fieldName: fieldName,
    fieldType: fieldType,
    isCustom,
  });

  return isRecordFieldReadOnly({
    isRecordDeleted,
    isFieldReadOnlyByPermissions,
    isFieldReadOnlyBySystem: fieldReadOnlyBySystem,
  });
};
