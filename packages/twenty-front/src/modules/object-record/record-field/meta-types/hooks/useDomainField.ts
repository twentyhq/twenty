import { useContext } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { FieldDomainValue } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldDomain } from '@/object-record/record-field/types/guards/isFieldDomain';
import { isFieldDomainValue } from '@/object-record/record-field/types/guards/isFieldDomainValue';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';

export const useDomainField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.Domain, isFieldDomain, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldDomainValue>(
    recordStoreFamilySelector({
      recordId: entityId,
      fieldName: fieldName,
    }),
  );

  const { setDraftValue, getDraftValueSelector } =
    useRecordFieldInput<FieldDomainValue>(`${entityId}-${fieldName}`);

  const draftValue = useRecoilValue(getDraftValueSelector());

  const persistField = usePersistField();

  const persistDomainField = (newValue: FieldDomainValue) => {
    if (!isFieldDomainValue(newValue)) return;

    persistField(newValue);
  };

  return {
    fieldDefinition,
    fieldValue,
    draftValue,
    setDraftValue,
    setFieldValue,
    hotkeyScope,
    persistDomainField,
  };
};
