import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

type IsRecordStoreMissingLoadedFieldsParams = {
  loadedRecord: ObjectRecord | undefined;
  storedRecord: ObjectRecord | null | undefined;
};

export const isRecordStoreMissingLoadedFields = ({
  loadedRecord,
  storedRecord,
}: IsRecordStoreMissingLoadedFieldsParams): boolean => {
  if (!isDefined(loadedRecord)) {
    return false;
  }

  if (!isDefined(storedRecord)) {
    return true;
  }

  return Object.keys(loadedRecord).some(
    (fieldName) => !(fieldName in storedRecord),
  );
};
