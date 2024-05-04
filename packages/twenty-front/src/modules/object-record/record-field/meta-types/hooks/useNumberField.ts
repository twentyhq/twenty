import { useContext } from 'react';

import {
  useSetTableValueRecordField,
  useTableValueRecordField,
} from '@/object-record/record-table/scopes/TableStatusSelectorContext';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import {
  canBeCastAsIntegerOrNull,
  castAsIntegerOrNull,
} from '~/utils/cast-as-integer-or-null';

import { FieldContext } from '../../contexts/FieldContext';
import { usePersistField } from '../../hooks/usePersistField';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldNumber } from '../../types/guards/isFieldNumber';

export const useNumberField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.Number, isFieldNumber, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  // const [fieldValue, setFieldValue] = useRecoilState<number | null>(
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

  const persistNumberField = (newValue: string) => {
    if (!canBeCastAsIntegerOrNull(newValue)) {
      return;
    }

    const castedValue = castAsIntegerOrNull(newValue);

    persistField(castedValue);
  };

  // const { setDraftValue, getDraftValueSelector } =
  //   useRecordFieldInput<FieldNumberValue>(`${entityId}-${fieldName}`);

  // const draftValue = useRecoilValue(getDraftValueSelector());

  const setDraftValue = (...args: any[]) => {};
  const draftValue: any = null;

  return {
    fieldDefinition,
    fieldValue,
    draftValue,
    setDraftValue,
    setFieldValue,
    hotkeyScope,
    persistNumberField,
  };
};
