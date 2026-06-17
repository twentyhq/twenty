import { useEffect, useState } from 'react';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useTriggerInitialRecordTableDataLoad } from '@/object-record/record-table/virtualization/hooks/useTriggerInitialRecordTableDataLoad';

export const RecordTableRecordLimitReloadEffect = () => {
  const { recordLimit } = useRecordIndexContextOrThrow();

  const { triggerInitialRecordTableDataLoad } =
    useTriggerInitialRecordTableDataLoad();

  const [previousRecordLimit, setPreviousRecordLimit] = useState(recordLimit);

  useEffect(() => {
    if (previousRecordLimit === recordLimit) {
      return;
    }

    setPreviousRecordLimit(recordLimit);

    void triggerInitialRecordTableDataLoad();
  }, [recordLimit, previousRecordLimit, triggerInitialRecordTableDataLoad]);

  return null;
};
