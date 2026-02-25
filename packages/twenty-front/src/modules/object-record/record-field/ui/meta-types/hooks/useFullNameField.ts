import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordFieldInput } from '@/object-record/record-field/ui/hooks/useRecordFieldInput';
import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/ui/states/recordFieldInputDraftValueComponentState';
import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldFullName } from '@/object-record/record-field/ui/types/guards/isFieldFullName';
import { recordStoreFamilySelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreFamilySelectorV2';
import { useAtomFamilySelectorState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useFullNameField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.FULL_NAME,
    isFieldFullName,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useAtomFamilySelectorState(
    recordStoreFamilySelectorV2,
    { recordId, fieldName },
  );

  const { setDraftValue } = useRecordFieldInput<FieldFullNameValue>();

  const draftValue = useAtomComponentStateValue(
    recordFieldInputDraftValueComponentState,
  );

  return {
    fieldDefinition,
    fieldValue,
    setFieldValue,
    draftValue,
    setDraftValue,
  };
};
