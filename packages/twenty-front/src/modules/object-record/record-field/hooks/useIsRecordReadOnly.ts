import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

type UseIsRecordReadOnlyParams = {
  recordId: string;
  objectMetadataId: string;
};

export const useIsRecordReadOnly = ({
  recordId,
  objectMetadataId,
}: UseIsRecordReadOnlyParams) => {
  const recordDeletedAt = useRecoilValue<ObjectRecord | null>(
    recordStoreFamilySelector({
      recordId,
      fieldName: 'deletedAt',
    }),
  );

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const hasObjectReadOnlyPermission =
    objectPermissionsByObjectMetadataId[objectMetadataId]
      ?.canUpdateObjectRecords === false;

  return hasObjectReadOnlyPermission || isDefined(recordDeletedAt);
};
