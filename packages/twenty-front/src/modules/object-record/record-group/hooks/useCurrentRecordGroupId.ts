import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { useContext } from 'react';

export const useCurrentRecordGroupId = () => {
  const context = useContext(RecordGroupContext);

  if (!context) {
    throw new Error(
      'useCurrentRecordGroup must be used within a RecordGroupContextProvider',
    );
  }

  if (!context.recordGroupId) {
    throw new Error('RecordGroupContext is malformed');
  }

  return context.recordGroupId;
};
