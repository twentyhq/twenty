import { useContext } from 'react';
import { SetterOrUpdater, useRecoilState, useRecoilValue } from 'recoil';

import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { FieldFieldPathValue } from '@/object-record/record-field/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldFieldPathDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { isFieldFieldPath } from '@/object-record/record-field/types/guards/isFieldFieldPath';
import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';

export const useFieldPathField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.FieldPath,
    isFieldFieldPath,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldFieldPathValue>(
    recordStoreFamilySelector({
      recordId: entityId,
      fieldName: fieldName,
    }),
  );

  const { setDraftValue, getDraftValueSelector } =
    useRecordFieldInput<FieldFieldPathValue>(`${entityId}-${fieldName}`);

  const draftValue = useRecoilValue(getDraftValueSelector());

  return {
    draftValue: draftValue as FieldFieldPathDraftValue | undefined,
    setDraftValue: setDraftValue as SetterOrUpdater<
      FieldFieldPathDraftValue | undefined
    >,
    fieldDefinition,
    fieldValue,
    setFieldValue,
    hotkeyScope,
  };
};
