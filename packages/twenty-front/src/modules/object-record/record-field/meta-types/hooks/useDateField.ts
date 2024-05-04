import { useContext } from 'react';

import { isFieldDate } from '@/object-record/record-field/types/guards/isFieldDate';
import {
  useSetTableValueRecordField,
  useTableValueRecordField,
} from '@/object-record/record-table/scopes/TableStatusSelectorContext';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';

export const useDateField = () => {
  const { entityId, fieldDefinition, hotkeyScope, clearable } =
    useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.Date, isFieldDate, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useTableValueRecordField(entityId, fieldName);
  const setTableValueRecordField = useSetTableValueRecordField();

  const setFieldValue = (newValue: string) => {
    setTableValueRecordField(entityId, fieldName, newValue);
  };

  // const [fieldValue, setFieldValue] = useRecoilState<string>(
  //   recordStoreFamilySelector({
  //     recordId: entityId,
  //     fieldName: fieldName,
  //   }),
  // );

  const setDraftValue = (...args: any[]) => {};
  const draftValue = null;

  // const { setDraftValue } = useRecordFieldInput<FieldDateValue>(
  //   `${entityId}-${fieldName}`,
  // );

  return {
    fieldDefinition,
    fieldValue,
    setDraftValue,
    setFieldValue,
    hotkeyScope,
    clearable,
  };
};
