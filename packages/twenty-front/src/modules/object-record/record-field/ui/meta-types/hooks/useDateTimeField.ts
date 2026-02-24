import { useContext } from 'react';

import { useRecordFieldInput } from '@/object-record/record-field/ui/hooks/useRecordFieldInput';
import { type FieldDateTimeValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilySelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreFamilySelectorV2';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldDateTime } from '@/object-record/record-field/ui/types/guards/isFieldDateTime';
import { useFamilySelectorState } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorState';

export const useDateTimeField = () => {
  const { recordId, fieldDefinition, clearable } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.DATE_TIME,
    isFieldDateTime,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useFamilySelectorState(
    recordStoreFamilySelectorV2,
    { recordId, fieldName },
  );

  const { setDraftValue } = useRecordFieldInput<FieldDateTimeValue>();

  return {
    fieldDefinition,
    fieldValue,
    setDraftValue,
    setFieldValue,
    clearable,
  };
};
