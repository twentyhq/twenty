import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

type UseIsRecordReadOnlyParams = {
  recordId: string;
};

export const useIsRecordDeleted = ({
  recordId,
}: UseIsRecordReadOnlyParams): boolean => {
  const recordDeletedAt = useRecoilValue<ObjectRecord | null>(
    recordStoreFamilySelector({
      recordId,
      fieldName: 'deletedAt',
    }),
  );

  return isDefined(recordDeletedAt);
};
