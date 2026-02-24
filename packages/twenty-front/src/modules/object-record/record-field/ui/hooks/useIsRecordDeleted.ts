import { recordStoreFamilySelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreFamilySelectorV2';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';

type UseIsRecordReadOnlyParams = {
  recordId: string;
};

export const useIsRecordDeleted = ({
  recordId,
}: UseIsRecordReadOnlyParams): boolean => {
  const recordDeletedAt = useFamilySelectorValue(recordStoreFamilySelectorV2, {
    recordId,
    fieldName: 'deletedAt',
  }) as ObjectRecord | null;

  return isDefined(recordDeletedAt);
};
