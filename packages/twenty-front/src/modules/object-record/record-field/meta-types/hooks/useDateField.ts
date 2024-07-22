import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { FieldDateValue } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldDate } from '@/object-record/record-field/types/guards/isFieldDate';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';

export const useDateField = () => {
  const { recordId, fieldDefinition, hotkeyScope, clearable } =
    useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.Date, isFieldDate, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<string>(
    recordStoreFamilySelector({
      recordId,
      fieldName: fieldName,
    }),
  );

  const { setDraftValue } = useRecordFieldInput<FieldDateValue>(
    `${recordId}-${fieldName}`,
  );

  return {
    fieldDefinition,
    fieldValue,
    setDraftValue,
    setFieldValue,
    hotkeyScope,
    clearable,
  };
};
