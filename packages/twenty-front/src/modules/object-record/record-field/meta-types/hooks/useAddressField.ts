import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { isFieldAddressValue } from '@/object-record/record-field/types/guards/isFieldAddressValue';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/states/recordFieldInputDraftValueComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { FieldContext } from '../../contexts/FieldContext';
import { usePersistField } from '../../hooks/usePersistField';
import { FieldAddressValue } from '../../types/FieldMetadata';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldAddress } from '../../types/guards/isFieldAddress';

export const useAddressField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.ADDRESS,
    isFieldAddress,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldAddressValue>(
    recordStoreFamilySelector({
      recordId,
      fieldName: fieldName,
    }),
  );

  const persistField = usePersistField();

  const persistAddressField = (newValue: FieldAddressValue) => {
    if (!isFieldAddressValue(newValue)) {
      return;
    }

    persistField(newValue);
  };

  const { setDraftValue } = useRecordFieldInput<FieldAddressValue>();

  const draftValue = useRecoilComponentValue(
    recordFieldInputDraftValueComponentState,
  );

  return {
    fieldDefinition,
    fieldValue,
    setFieldValue,
    draftValue,
    setDraftValue,
    persistAddressField,
  };
};
