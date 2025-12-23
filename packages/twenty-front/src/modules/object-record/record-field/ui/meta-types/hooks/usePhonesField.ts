import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { useRecordFieldInput } from '@/object-record/record-field/ui/hooks/useRecordFieldInput';
import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldPhones } from '@/object-record/record-field/ui/types/guards/isFieldPhones';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/ui/states/recordFieldInputDraftValueComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';

export const usePhonesField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.PHONES, isFieldPhones, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldPhonesValue>(
    recordStoreFamilySelector({
      recordId,
      fieldName: fieldName,
    }),
  );

  const { setDraftValue } = useRecordFieldInput<FieldPhonesValue>();

  const draftValue = useRecoilComponentValue(
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
