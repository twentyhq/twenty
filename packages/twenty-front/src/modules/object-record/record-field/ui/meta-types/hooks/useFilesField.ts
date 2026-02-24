import { useContext } from 'react';

import { useRecordFieldInput } from '@/object-record/record-field/ui/hooks/useRecordFieldInput';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldFiles } from '@/object-record/record-field/ui/types/guards/isFieldFiles';
import { recordStoreFamilySelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreFamilySelectorV2';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/ui/states/recordFieldInputDraftValueComponentState';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { useFamilySelectorState } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';

export const useFilesField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.FILES, isFieldFiles, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useFamilySelectorState(
    recordStoreFamilySelectorV2,
    { recordId, fieldName },
  );

  const { setDraftValue } = useRecordFieldInput<FieldFilesValue[]>();

  const draftValue = useAtomComponentValue(
    recordFieldInputDraftValueComponentState,
  );

  return {
    fieldDefinition,
    fieldValue,
    draftValue,
    setDraftValue,
    setFieldValue,
  };
};
