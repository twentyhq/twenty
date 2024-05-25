import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useSetRecordValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

export const RecordValueSetterEffect = ({ recordId }: { recordId: string }) => {
  const setRecordValue = useSetRecordValue();

  const recordValue = useRecoilValue(recordStoreFamilyState(recordId));

  useEffect(() => {
    setRecordValue(recordId, recordValue);
  }, [setRecordValue, recordValue, recordId]);

  return null;
};
