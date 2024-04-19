import { useContext } from 'react';
import { isPossiblePhoneNumber } from 'libphonenumber-js';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { FieldPhoneValue } from '@/object-record/record-field/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { usePersistField } from '../../hooks/usePersistField';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldPhone } from '../../types/guards/isFieldPhone';

export const usePhoneField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.Phone, isFieldPhone, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<string>(
    recordStoreFamilySelector({
      recordId: entityId,
      fieldName: fieldName,
    }),
  );

  const persistField = usePersistField();

  const persistPhoneField = (newPhoneValue: string) => {
    if (!isPossiblePhoneNumber(newPhoneValue) && newPhoneValue !== '') return;

    persistField(newPhoneValue);
  };
  const { setDraftValue, getDraftValueSelector } =
    useRecordFieldInput<FieldPhoneValue>(`${entityId}-${fieldName}`);

  const draftValue = useRecoilValue(getDraftValueSelector());

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
