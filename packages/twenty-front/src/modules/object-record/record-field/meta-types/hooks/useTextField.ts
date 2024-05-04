import { useContext } from 'react';

import {
  useSetTableValueRecordField,
  useTableValueRecordField,
} from '@/object-record/record-table/scopes/TableStatusSelectorContext';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldText } from '../../types/guards/isFieldText';
import { isFieldTextValue } from '../../types/guards/isFieldTextValue';

export const useTextField = () => {
  const { entityId, fieldDefinition, hotkeyScope, maxWidth } =
    useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.Text, isFieldText, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  // const [fieldValue, setFieldValue] = useRecoilState<FieldTextValue>(
  //   recordStoreFamilySelector({
  //     recordId: entityId,
  //     fieldName: fieldName,
  //   }),
  // );

  const fieldValue = useTableValueRecordField(entityId, fieldName);
  const setTableValueRecordField = useSetTableValueRecordField();

  const setFieldValue = (newValue: string) => {
    setTableValueRecordField(entityId, fieldName, newValue);
  };

  const fieldTextValue = isFieldTextValue(fieldValue) ? fieldValue : '';

  // const { setDraftValue, getDraftValueSelector } =
  //   useRecordFieldInput<FieldTextValue>(`${entityId}-${fieldName}`);

  // const draftValue = useRecoilValue(getDraftValueSelector());

  const setDraftValue = (...args: any) => {};
  const draftValue = null;

  return {
    draftValue,
    setDraftValue,
    maxWidth,
    fieldDefinition,
    fieldValue: fieldTextValue,
    setFieldValue,
    hotkeyScope,
  };
};
