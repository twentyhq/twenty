import { recordStoreFamilySelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreFamilySelectorV2';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { isDefined } from 'twenty-shared/utils';

type UseIsRecordReadOnlyParams = {
  recordId: string;
};

export const useIsRecordDeleted = ({
  recordId,
}: UseIsRecordReadOnlyParams): boolean => {
  const recordDeletedAt = useFamilySelectorValueV2(
    recordStoreFamilySelectorV2,
    { recordId, fieldName: 'deletedAt' },
  ) as ObjectRecord | null;

  return isDefined(recordDeletedAt);
};
