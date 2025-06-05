import { useGetObjectPermissionsForObject } from '@/object-record/hooks/useGetObjectPermissionsForObject';
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

  const getObjectPermissionsForObject =
    useGetObjectPermissionsForObject(objectMetadataId);

  const objectPermissions = getObjectPermissionsForObject();

  const hasObjectUpdatePermissions =
    objectPermissions.canUpdateObjectRecords === true;

  return !hasObjectUpdatePermissions || isDefined(recordDeletedAt);
};
