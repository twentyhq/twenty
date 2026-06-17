import { useEffect, useState } from 'react';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useTriggerInitialRecordTableDataLoad } from '@/object-record/record-table/virtualization/hooks/useTriggerInitialRecordTableDataLoad';

export const RecordTableRecordLimitReloadEffect = () => {
  const { recordLimit } = useRecordTableContextOrThrow();

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
