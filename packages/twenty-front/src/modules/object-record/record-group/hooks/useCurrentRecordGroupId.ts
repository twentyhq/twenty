import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { useContext } from 'react';

export const useCurrentRecordGroupId = (): string => {
  const context = useContext(RecordGroupContext);

  if (!context) {
    throw new Error(
      'useCurrentRecordGroupId must be used within a RecordGroupContextProvider.',
    );
  }

  if (!context.recordGroupId) {
    throw new Error(
      'RecordGroupContext is malformed. recordGroupId is missing.',
    );
  }

  return context.recordGroupId;
};
