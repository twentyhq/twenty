import {
  UseFieldIsReadOnlyParams,
  useIsFieldReadOnly,
} from '@/object-record/record-field/hooks/read-only/useIsFieldReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/record-field/hooks/read-only/utils/isRecordFieldReadOnly';
import { useIsRecordDeleted } from '@/object-record/record-field/hooks/useIsRecordDeleted';

export const useIsRecordFieldReadOnly = ({
  recordId,
  fieldMetadataId,
  objectMetadataId,
  objectNameSingular,
  fieldName,
  fieldType,
  isCustom,
}: UseFieldIsReadOnlyParams & { recordId: string }) => {
  const isRecordDeleted = useIsRecordDeleted({ recordId });

  const isFieldReadOnly = useIsFieldReadOnly({
    fieldMetadataId,
    objectMetadataId,
    objectNameSingular,
    fieldName,
    fieldType,
    isCustom,
  });

  return isRecordFieldReadOnly({
    isRecordDeleted,
    isFieldReadOnly,
  });
};
