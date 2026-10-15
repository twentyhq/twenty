import { useContext } from 'react';

import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';

import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { isDefined } from 'twenty-shared/utils';
import { CoreRecordReferenceFieldsContext } from '@/object-record/record-field/ui/contexts/CoreRecordReferenceFieldsContext';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { getFieldValueSourceDefinition } from '@/object-record/record-field/ui/utils/getFieldValueSourceDefinition';

export const useIsFieldEmpty = () => {
  const { recordId, fieldDefinition, overridenIsFieldEmpty } =
    useContext(FieldContext);

  const coreRecordReferenceFields = useContext(
    CoreRecordReferenceFieldsContext,
  );

  const fieldValueSourceDefinition = getFieldValueSourceDefinition({
    fieldDefinition,
    coreRecordReferenceFields,
  });

  const fieldValue = useRecordFieldValue(
    recordId,
    fieldValueSourceDefinition.metadata.fieldName,
    fieldValueSourceDefinition,
  );

  if (isDefined(overridenIsFieldEmpty)) {
    return overridenIsFieldEmpty;
  }

  return isFieldValueEmpty({
    fieldDefinition: fieldValueSourceDefinition,
    fieldValue,
  });
};
