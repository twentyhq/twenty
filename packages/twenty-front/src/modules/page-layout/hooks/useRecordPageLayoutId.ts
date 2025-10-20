import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { DEFAULT_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultPageLayoutId';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { isDefined } from 'twenty-shared/utils';

export const useRecordPageLayoutId = ({
  id,
  targetObjectNameSingular,
}: TargetRecordIdentifier) => {
  const { record } = useFindOneRecord<ObjectRecord & { pageLayoutId?: string }>(
    {
      objectNameSingular: targetObjectNameSingular,
      objectRecordId: id,
    },
  );

  if (!isDefined(record)) {
    return {
      pageLayoutId: null,
    };
  }

  if (isDefined(record.pageLayoutId)) {
    return {
      pageLayoutId: record.pageLayoutId,
    };
  }

  // TODO: implement a default layout
  return {
    pageLayoutId: DEFAULT_PAGE_LAYOUT_ID,
  };
};
