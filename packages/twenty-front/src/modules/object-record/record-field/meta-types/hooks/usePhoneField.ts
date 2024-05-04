import { useContext } from 'react';
import { isPossiblePhoneNumber } from 'libphonenumber-js';

import {
  useSetTableValueRecordField,
  useTableValueRecordField,
} from '@/object-record/record-table/scopes/TableStatusSelectorContext';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { usePersistField } from '../../hooks/usePersistField';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldPhone } from '../../types/guards/isFieldPhone';

export const usePhoneField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.Phone, isFieldPhone, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  // const [fieldValue, setFieldValue] = useRecoilState<string>(
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

  const persistField = usePersistField();

  const persistPhoneField = (newPhoneValue: string) => {
    if (!isPossiblePhoneNumber(newPhoneValue) && newPhoneValue !== '') return;

    persistField(newPhoneValue);
  };
  // const { setDraftValue, getDraftValueSelector } =
  //   useRecordFieldInput<FieldPhoneValue>(`${entityId}-${fieldName}`);

  // const draftValue = useRecoilValue(getDraftValueSelector());

  const setDraftValue = (...args: any[]) => {};
  const draftValue: any = null;

  return {
    fieldDefinition,
    fieldValue,
    setFieldValue,
    draftValue,
    setDraftValue,
    hotkeyScope,
    persistPhoneField,
  };
};
