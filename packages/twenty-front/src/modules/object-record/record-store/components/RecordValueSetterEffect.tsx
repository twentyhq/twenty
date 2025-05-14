import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import {
  useRecordValue,
  useSetRecordValue,
} from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

// TODO: should be optimized and put higher up
export const RecordValueSetterEffect = ({ recordId }: { recordId: string }) => {
  const setRecordValueInContextSelector = useSetRecordValue();

  const recordValueFromContextSelector = useRecordValue(recordId);

  const recordValueFromRecoil = useRecoilValue(
    recordStoreFamilyState(recordId),
  );

  useEffect(() => {
    if (!isDeeplyEqual(recordValueFromContextSelector, recordValueFromRecoil)) {
      setRecordValueInContextSelector(recordId, recordValueFromRecoil);
    }
  }, [
    setRecordValueInContextSelector,
    recordValueFromRecoil,
    recordId,
    recordValueFromContextSelector,
  ]);

  return null;
};
