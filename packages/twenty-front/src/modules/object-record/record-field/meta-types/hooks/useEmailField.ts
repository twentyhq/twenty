import { useContext } from 'react';

import {
  useSetTableValueRecordField,
  useTableValueRecordField,
} from '@/object-record/record-table/scopes/TableStatusSelectorContext';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldEmail } from '../../types/guards/isFieldEmail';

export const useEmailField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.Email, isFieldEmail, fieldDefinition);

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

  // const { setDraftValue, getDraftValueSelector } =
  //   useRecordFieldInput<FieldEmailValue>(`${entityId}-${fieldName}`);

  const setDraftValue = (...args: any[]) => {};
  const draftValue = null;
  // useRecoilValue(getDraftValueSelector());

  return {
    fieldDefinition,
    draftValue,
    setDraftValue,
    fieldValue,
    setFieldValue,
    hotkeyScope,
  };
};
