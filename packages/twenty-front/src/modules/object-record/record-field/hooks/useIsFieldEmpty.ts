import { useContext } from 'react';

import { isFieldValueEmpty } from '@/object-record/record-field/utils/isFieldValueEmpty';
import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldContext } from '../contexts/FieldContext';
import { isDefined } from 'twenty-shared/utils';

export const useIsFieldEmpty = () => {
  const { recordId, fieldDefinition, overridenIsFieldEmpty } =
    useContext(FieldContext);

  const fieldValue = useRecordFieldValue(
    recordId,
    fieldDefinition?.metadata?.fieldName ?? '',
  );

  if (isDefined(overridenIsFieldEmpty)) {
    return overridenIsFieldEmpty;
  }

  return isFieldValueEmpty({
    fieldDefinition,
    fieldValue,
  });
};
