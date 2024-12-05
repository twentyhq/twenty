import { useContext } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { FieldNumberValue } from '@/object-record/record-field/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import {
  canBeCastAsNumberOrNull,
  castAsNumberOrNull,
} from '~/utils/cast-as-number-or-null';

import { isNull } from '@sniptt/guards';
import { FieldContext } from '../../contexts/FieldContext';
import { usePersistField } from '../../hooks/usePersistField';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldNumber } from '../../types/guards/isFieldNumber';

export const useNumberField = () => {
  const { recordId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.Number, isFieldNumber, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<number | null>(
    recordStoreFamilySelector({
      recordId,
      fieldName: fieldName,
    }),
  );

  const persistField = usePersistField();

  const persistNumberField = (newValue: string) => {
    if (fieldDefinition?.metadata?.settings?.type === 'percentage') {
      const newValueEscaped = newValue.replaceAll('%', '');
      if (!canBeCastAsNumberOrNull(newValueEscaped)) {
        return;
      }
      const castedValue = castAsNumberOrNull(newValue);
      if (!isNull(castedValue)) {
        persistField(castedValue / 100);
        return;
      }
      persistField(null);
      return;
    }
    if (!canBeCastAsNumberOrNull(newValue)) {
      return;
    }
    const castedValue = castAsNumberOrNull(newValue);
    persistField(castedValue);
  };

  const { setDraftValue, getDraftValueSelector } =
    useRecordFieldInput<FieldNumberValue>(`${recordId}-${fieldName}`);

  const draftValue = useRecoilValue(getDraftValueSelector());

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
