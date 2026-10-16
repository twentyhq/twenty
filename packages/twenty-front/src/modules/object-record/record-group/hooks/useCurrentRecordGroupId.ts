import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useCurrentRecordGroupId = (): string => {
  const context = useContext(RecordGroupContext);

  if (!isDefined(context)) {
    throw new Error(
      doNotTranslate(
        'useCurrentRecordGroupId must be used within a RecordGroupContextProvider.',
      ),
    );
  }

  if (!context.recordGroupId) {
    throw new Error(
      doNotTranslate(
        'RecordGroupContext is malformed. recordGroupId is missing.',
      ),
    );
  }

  return context.recordGroupId;
};
