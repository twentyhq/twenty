import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';

type UseIsRecordReadOnlyParams = {
  recordId: string;
};

export const useIsRecordDeleted = ({
  recordId,
}: UseIsRecordReadOnlyParams): boolean => {
  const recordDeletedAt = useAtomFamilySelectorValue(
    recordStoreFamilySelector,
    {
      recordId,
      fieldName: 'deletedAt',
    },
  ) as ObjectRecord | null;

  return isDefined(recordDeletedAt);
};
