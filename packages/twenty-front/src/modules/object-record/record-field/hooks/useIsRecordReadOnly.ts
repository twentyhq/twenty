import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

type UseIsRecordReadOnlyParams = {
  recordId: string;
};

export const useIsRecordReadOnly = ({
  recordId,
}: UseIsRecordReadOnlyParams) => {
  const recordDeletedAt = useRecoilValue<ObjectRecord | null>(
    recordStoreFamilySelector({
      recordId,
      fieldName: 'deletedAt',
    }),
  );

  const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

  return hasObjectReadOnlyPermission || isDefined(recordDeletedAt);
};
