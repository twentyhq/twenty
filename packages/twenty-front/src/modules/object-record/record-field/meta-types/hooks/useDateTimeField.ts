import { useContext } from 'react';

import {
  useSetTableValueRecordField,
  useTableValueRecordField,
} from '@/object-record/record-table/scopes/TableStatusSelectorContext';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldDateTime } from '../../types/guards/isFieldDateTime';

export const useDateTimeField = () => {
  const { entityId, fieldDefinition, hotkeyScope, clearable } =
    useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.DateTime,
    isFieldDateTime,
    fieldDefinition,
  );

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

  // const { setDraftValue } = useRecordFieldInput<FieldDateTimeValue>(
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
