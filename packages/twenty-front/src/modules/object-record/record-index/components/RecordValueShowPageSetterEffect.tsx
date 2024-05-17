import { useEffect } from 'react';

import { useSetRecordValue } from '@/object-record/record-index/contexts/RecordFieldValueSelectorContext';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from '~/utils/isDefined';

export const RecordValueShowPageSetterEffect = ({
  record,
}: {
  record: ObjectRecord | null | undefined;
}) => {
  const setRecordValue = useSetRecordValue();

  useEffect(() => {
    if (isDefined(record)) {
      setRecordValue(record.id, record);
    }
  }, [setRecordValue, record]);

  return null;
};
