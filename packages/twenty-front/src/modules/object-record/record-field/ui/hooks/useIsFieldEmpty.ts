import { useContext } from 'react';

import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';

import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { isDefined } from 'twenty-shared/utils';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';

export const useIsFieldEmpty = () => {
  const { recordId, fieldDefinition, overridenIsFieldEmpty } =
    useContext(FieldContext);

  const fieldValue = useRecordFieldValue(
    recordId,
    fieldDefinition?.metadata?.fieldName ?? '',
    fieldDefinition,
  );

  if (isDefined(overridenIsFieldEmpty)) {
    return overridenIsFieldEmpty;
  }

  return isFieldValueEmpty({
    fieldDefinition,
    fieldValue,
  });
};
