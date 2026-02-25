import { useContext } from 'react';

import { useRecordFieldInput } from '@/object-record/record-field/ui/hooks/useRecordFieldInput';
import { type FieldDateValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldDate } from '@/object-record/record-field/ui/types/guards/isFieldDate';
import { recordStoreFamilySelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreFamilySelectorV2';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { useAtomFamilySelectorState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorState';

export const useDateField = () => {
  const { recordId, fieldDefinition, clearable } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.DATE, isFieldDate, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useAtomFamilySelectorState(
    recordStoreFamilySelectorV2,
    { recordId, fieldName },
  );

  const typedFieldValue = fieldValue as string | null | undefined;

  const { setDraftValue } = useRecordFieldInput<FieldDateValue>();

  return {
    fieldDefinition,
    fieldValue: typedFieldValue,
    setDraftValue,
    setFieldValue,
    clearable,
  };
};
