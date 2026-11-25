import { useRecordCreationFormContextOrThrow } from '@/object-record/record-form/contexts/RecordCreationFormContext';

export const useRecordCreationForm = () => {
  const { requestRecordCreation } = useRecordCreationFormContextOrThrow();

  return { requestRecordCreation };
};
