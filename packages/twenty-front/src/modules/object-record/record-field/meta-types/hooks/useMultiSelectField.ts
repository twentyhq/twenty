import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/states/recordFieldInputDraftValueComponentState';
import { FieldMultiSelectValue } from '@/object-record/record-field/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldMultiSelect } from '@/object-record/record-field/types/guards/isFieldMultiSelect';
import { isFieldMultiSelectValue } from '@/object-record/record-field/types/guards/isFieldMultiSelectValue';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useMultiSelectField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.MULTI_SELECT,
    isFieldMultiSelect,
    fieldDefinition,
  );

  const { fieldName } = fieldDefinition.metadata;

  const [fieldValues, setFieldValue] = useRecoilState<FieldMultiSelectValue>(
    recordStoreFamilySelector({
      recordId,
      fieldName: fieldName,
    }),
  );

  const fieldMultiSelectValues = isFieldMultiSelectValue(fieldValues)
    ? fieldValues
    : null;
  const persistField = usePersistField();

  const { setDraftValue } = useRecordFieldInput<FieldMultiSelectValue>();

  const draftValue = useRecoilComponentValue(
    recordFieldInputDraftValueComponentState,
  );

  return {
    recordId,
    fieldDefinition,
    persistField,
    fieldValues: fieldMultiSelectValues,
    draftValue,
    setDraftValue,
    setFieldValue,
  };
};
