import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { getRecordPageLayoutId } from '@/page-layout/utils/getRecordPageLayoutId';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useRecordPageLayoutIdFromRecordStoreOrThrow = ({
  id,
  targetObjectNameSingular,
}: TargetRecordIdentifier) => {
  const record = useRecoilValue(recordStoreFamilyState(id));

  if (!isDefined(record)) {
    throw new Error(`Record with id ${id} not found in record store`);
  }

  const pageLayoutId = getRecordPageLayoutId({
    record,
    targetObjectNameSingular,
  });

  if (!isDefined(pageLayoutId)) {
    throw new Error(`Page layout id not found for record with id ${id}`);
  }

  return {
    pageLayoutId,
  };
};
