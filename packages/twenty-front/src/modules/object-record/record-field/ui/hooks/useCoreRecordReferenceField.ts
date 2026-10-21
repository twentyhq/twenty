import { useContext } from 'react';

import { CoreRecordReferenceFieldsContext } from '@/object-record/record-field/ui/contexts/CoreRecordReferenceFieldsContext';
import { getMatchingCoreRecordReferenceFields } from '@/object-record/record-field/ui/utils/getMatchingCoreRecordReferenceFields';

export const useCoreRecordReferenceField = ({
  objectNameSingular,
  fieldName,
}: {
  objectNameSingular: string | undefined;
  fieldName: string;
}) => {
  const coreRecordReferenceFields = useContext(
    CoreRecordReferenceFieldsContext,
  );

  return getMatchingCoreRecordReferenceFields({
    coreRecordReferenceFields,
    objectNameSingular,
    fieldNames: [fieldName],
  }).at(0);
};
