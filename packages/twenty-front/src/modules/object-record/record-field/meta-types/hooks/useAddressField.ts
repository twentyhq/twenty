import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { isFieldAddressValue } from '@/object-record/record-field/types/guards/isFieldAddressValue';
import {
  useSetTableValueRecordField,
  useTableValueRecordField,
} from '@/object-record/record-table/scopes/TableStatusSelectorContext';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { usePersistField } from '../../hooks/usePersistField';
import { FieldAddressValue } from '../../types/FieldMetadata';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldAddress } from '../../types/guards/isFieldAddress';

export const useAddressField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.Address,
    isFieldAddress,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useTableValueRecordField(entityId, fieldName);
  const setTableValueRecordField = useSetTableValueRecordField();

  const setFieldValue = (newValue: FieldAddressValue) => {
    if (!isFieldAddressValue(newValue)) {
      return;
    }

    setTableValueRecordField(entityId, fieldName, newValue);
  };

  // const [fieldValue, setFieldValue] = useRecoilState<FieldAddressValue>(
  //   recordStoreFamilySelector({
  //     recordId: entityId,
  //     fieldName: fieldName,
  //   }),
  // );

  const persistField = usePersistField();

  const persistAddressField = (newValue: FieldAddressValue) => {
    if (!isFieldAddressValue(newValue)) {
      return;
    }

    persistField(newValue);
  };

  const { setDraftValue, getDraftValueSelector } =
    useRecordFieldInput<FieldAddressValue>(`${entityId}-${fieldName}`);

  const draftValue = useRecoilValue(getDraftValueSelector());

  return {
    fieldDefinition,
    fieldValue,
    setFieldValue,
    draftValue,
    setDraftValue,
    hotkeyScope,
    persistAddressField,
  };
};
