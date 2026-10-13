import { useContext } from 'react';

import { RecordFieldDisplayOverridesContext } from '@/object-record/record-field/ui/contexts/RecordFieldDisplayOverridesContext';
import { getMatchingRecordFieldDisplayOverrides } from '@/object-record/record-field/ui/utils/getMatchingRecordFieldDisplayOverrides';

export const useRecordFieldDisplayOverride = ({
  objectNameSingular,
  fieldName,
}: {
  objectNameSingular: string | undefined;
  fieldName: string;
}) => {
  const recordFieldDisplayOverrides = useContext(
    RecordFieldDisplayOverridesContext,
  );

  return getMatchingRecordFieldDisplayOverrides({
    recordFieldDisplayOverrides,
    objectNameSingular,
    fieldNames: [fieldName],
  }).at(0);
};
