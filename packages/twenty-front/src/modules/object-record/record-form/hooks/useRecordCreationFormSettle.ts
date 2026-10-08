import { useRecordCreationFormContextOrThrow } from '@/object-record/record-form/contexts/RecordCreationFormContext';

export const useRecordCreationFormSettle = () => {
  const { settleRecordCreationDraft } = useRecordCreationFormContextOrThrow();

  return { settleRecordCreationDraft };
};
