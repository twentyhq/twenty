import { isObjectReadOnly } from '@/object-record/record-field/hooks/read-only/utils/isObjectReadOnly';
import { useIsRecordDeleted } from '@/object-record/record-field/hooks/useIsRecordDeleted';
import { ObjectPermission } from '~/generated/graphql';

export const useIsRecordReadOnly = ({
  recordId,
  objectPermissions,
}: {
  recordId: string;
  objectPermissions: ObjectPermission;
}) => {
  const isRecordDeleted = useIsRecordDeleted({ recordId });

  const isObjectReadOnlyByPermissions = isObjectReadOnly({
    objectPermissions,
  });

  return isRecordDeleted || isObjectReadOnlyByPermissions;
};
