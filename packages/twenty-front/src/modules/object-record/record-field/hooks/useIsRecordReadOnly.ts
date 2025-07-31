import { useFieldIsReadOnlyByPermissions } from '@/object-record/record-field/hooks/useIsFieldReadOnlyByPermissions';
import { useIsRecordDeleted } from '@/object-record/record-field/hooks/useIsRecordDeleted';

export const useIsRecordReadOnly = ({
  recordId,
  objectMetadataId,
}: {
  recordId: string;
  objectMetadataId: string;
}) => {
  const isRecordDeleted = useIsRecordDeleted({ recordId });

  const isObjectReadOnlyByPermissions = useFieldIsReadOnlyByPermissions({
    objectMetadataId,
  });

  return isRecordDeleted || isObjectReadOnlyByPermissions;
};
