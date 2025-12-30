import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { useRecordFieldInput } from '@/object-record/record-field/ui/hooks/useRecordFieldInput';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/ui/states/recordFieldInputDraftValueComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { type FieldSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldSelect } from '@/object-record/record-field/ui/types/guards/isFieldSelect';
import { isFieldSelectValue } from '@/object-record/record-field/ui/types/guards/isFieldSelectValue';

export const useSelectField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.SELECT, isFieldSelect, fieldDefinition);

  const { fieldName } = fieldDefinition.metadata;

  const [fieldValue, setFieldValue] = useRecoilState<FieldSelectValue>(
    recordStoreFamilySelector({
      recordId,
      fieldName: fieldName,
    }),
  );

  const fieldSelectValue = isFieldSelectValue(fieldValue) ? fieldValue : null;

  const { setDraftValue } = useRecordFieldInput<FieldSelectValue>();

  const draftValue = useRecoilComponentValue(
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
