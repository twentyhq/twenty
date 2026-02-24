import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordFieldInput } from '@/object-record/record-field/ui/hooks/useRecordFieldInput';
import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/ui/states/recordFieldInputDraftValueComponentState';
import { type FieldArrayValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldArray } from '@/object-record/record-field/ui/types/guards/isFieldArray';
import { recordStoreFamilySelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreFamilySelectorV2';
import { useFamilySelectorState } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { useContext } from 'react';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useArrayField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.ARRAY, isFieldArray, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useFamilySelectorState(
    recordStoreFamilySelectorV2,
    { recordId, fieldName },
  );

  const { setDraftValue } = useRecordFieldInput<FieldArrayValue>();

  const draftValue = useAtomComponentValue(
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
