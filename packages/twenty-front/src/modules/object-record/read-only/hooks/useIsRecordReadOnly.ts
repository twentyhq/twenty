import { useIsObjectReadOnly } from '@/object-record/read-only/hooks/useIsObjectReadOnly';
import { useIsRecordDeleted } from '@/object-record/record-field/ui/hooks/useIsRecordDeleted';
import { recordPermissionsFamilySelector } from '@/object-record/record-sharing/states/recordPermissionsFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

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

  const recordPermissions = useAtomFamilySelectorValue(
    recordPermissionsFamilySelector,
    { objectMetadataId, recordId },
  );

  return (
    isObjectReadOnly ||
    isRecordDeleted ||
    recordPermissions?.canUpdate === false
  );
};
