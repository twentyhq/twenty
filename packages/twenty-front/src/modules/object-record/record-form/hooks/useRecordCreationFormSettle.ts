import { RecordCreationFormContext } from '@/object-record/record-form/contexts/RecordCreationFormContext';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useCallback, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRecordCreationFormSettle = () => {
  const recordCreationFormContext = useContext(RecordCreationFormContext);

  const settleRecordCreationDraft = useCallback(
    (draftRecord: Partial<ObjectRecord> | null) => {
      if (isDefined(recordCreationFormContext)) {
        recordCreationFormContext.settleRecordCreationDraft(draftRecord);
      }
    },
    [recordCreationFormContext],
  );

  return { settleRecordCreationDraft };
};
