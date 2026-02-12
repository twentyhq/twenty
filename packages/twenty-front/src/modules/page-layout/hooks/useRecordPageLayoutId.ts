import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getRecordPageLayoutId } from '@/page-layout/utils/getRecordPageLayoutId';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';

export const useRecordPageLayoutId = ({
  id,
  targetObjectNameSingular,
}: TargetRecordIdentifier) => {
  const { record } = useFindOneRecord<ObjectRecord & { pageLayoutId?: string }>(
    {
      objectNameSingular: targetObjectNameSingular,
      objectRecordId: id,
      withSoftDeleted: true,
    },
  );

  const pageLayoutId = getRecordPageLayoutId({
    record,
    targetObjectNameSingular,
  });

  return {
    pageLayoutId,
  };
};
