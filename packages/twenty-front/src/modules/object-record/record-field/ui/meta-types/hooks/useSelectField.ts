import { useContext } from 'react';

import { useRecordFieldInput } from '@/object-record/record-field/ui/hooks/useRecordFieldInput';
import { recordStoreFamilySelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreFamilySelectorV2';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/ui/states/recordFieldInputDraftValueComponentState';
import { useFamilySelectorState } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { type FieldSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldSelect } from '@/object-record/record-field/ui/types/guards/isFieldSelect';
import { isFieldSelectValue } from '@/object-record/record-field/ui/types/guards/isFieldSelectValue';

export const useSelectField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.SELECT, isFieldSelect, fieldDefinition);

  const { fieldName } = fieldDefinition.metadata;

  const [fieldValue, setFieldValue] = useFamilySelectorState(
    recordStoreFamilySelectorV2,
    { recordId, fieldName },
  );

  const fieldSelectValue = isFieldSelectValue(fieldValue) ? fieldValue : null;

  const { setDraftValue } = useRecordFieldInput<FieldSelectValue>();

  const draftValue = useAtomComponentValue(
    recordFieldInputDraftValueComponentState,
  );

  return {
    recordId,
    fieldDefinition,
    fieldValue: fieldSelectValue,
    draftValue,
    setDraftValue,
    setFieldValue,
  };
};
