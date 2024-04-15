import { useContext } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { FieldJsonValue } from '@/object-record/record-field/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldRawJson } from '../../types/guards/isFieldRawJson';
import { isFieldTextValue } from '../../types/guards/isFieldTextValue';

export const useJsonField = () => {
  const { entityId, fieldDefinition, hotkeyScope, maxWidth } =
    useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.RawJson,
    isFieldRawJson,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldJsonValue>(
    recordStoreFamilySelector({
      recordId: entityId,
      fieldName: fieldName,
    }),
  );
  const fieldTextValue = isFieldTextValue(fieldValue) ? fieldValue : '';

  const { setDraftValue, getDraftValueSelector } =
    useRecordFieldInput<FieldJsonValue>(`${entityId}-${fieldName}`);

  const draftValue = useRecoilValue(getDraftValueSelector());

  return {
    draftValue,
    setDraftValue,
    maxWidth,
    fieldDefinition,
    fieldValue: fieldTextValue,
    setFieldValue,
    hotkeyScope,
  };
};
