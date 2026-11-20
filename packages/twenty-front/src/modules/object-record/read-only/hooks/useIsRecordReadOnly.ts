import { useIsObjectReadOnly } from '@/object-record/read-only/hooks/useIsObjectReadOnly';
import { useIsRecordDeleted } from '@/object-record/record-field/ui/hooks/useIsRecordDeleted';

type UseIsRecordReadOnlyParams = {
  recordId: string;
  objectMetadataId: string;
};

export const useIsRecordReadOnly = ({
  recordId,
  objectMetadataId,
}: UseIsRecordReadOnlyParams) => {
  const isObjectReadOnly = useIsObjectReadOnly(objectMetadataId);
  const isRecordDeleted = useIsRecordDeleted({ recordId });

  return isObjectReadOnly || isRecordDeleted;
};
