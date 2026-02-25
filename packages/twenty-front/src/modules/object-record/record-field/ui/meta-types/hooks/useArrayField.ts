import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordFieldInput } from '@/object-record/record-field/ui/hooks/useRecordFieldInput';
import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/ui/states/recordFieldInputDraftValueComponentState';
import { type FieldArrayValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldArray } from '@/object-record/record-field/ui/types/guards/isFieldArray';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useAtomFamilySelectorState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useContext } from 'react';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useArrayField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.ARRAY, isFieldArray, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useAtomFamilySelectorState(
    recordStoreFamilySelector,
    { recordId, fieldName },
  );

  const { setDraftValue } = useRecordFieldInput<FieldArrayValue>();

  const draftValue = useAtomComponentStateValue(
    recordFieldInputDraftValueComponentState,
  );

  return {
    fieldValue,
    fieldDefinition,
    draftValue,
    setFieldValue,
    setDraftValue,
  };
};
