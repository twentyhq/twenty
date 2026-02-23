import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordFieldInput } from '@/object-record/record-field/ui/hooks/useRecordFieldInput';
import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/ui/states/recordFieldInputDraftValueComponentState';
import { type FieldTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import { isFieldTextValue } from '@/object-record/record-field/ui/types/guards/isFieldTextValue';
import { recordStoreFamilySelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreFamilySelectorV2';
import { useFamilySelectorStateV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorStateV2';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useTextField = () => {
  const { recordId, fieldDefinition, maxWidth } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.TEXT, isFieldText, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useFamilySelectorStateV2(
    recordStoreFamilySelectorV2,
    { recordId, fieldName },
  );
  const fieldTextValue = isFieldTextValue(fieldValue) ? fieldValue : '';

  const { setDraftValue } = useRecordFieldInput<FieldTextValue>();

  const draftValue = useRecoilComponentValue(
    recordFieldInputDraftValueComponentState,
  );

  return {
    draftValue,
    setDraftValue,
    maxWidth,
    fieldDefinition,
    fieldValue: fieldTextValue,
    setFieldValue,
  };
};
