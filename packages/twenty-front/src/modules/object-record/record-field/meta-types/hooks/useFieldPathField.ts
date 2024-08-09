import { useContext, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import {
  FieldFieldPathValue,
  FieldTextValue,
} from '@/object-record/record-field/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldFieldPathDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { isFieldFieldPath } from '@/object-record/record-field/types/guards/isFieldFieldPath';
import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';

export const useFieldPathField = () => {
  const { recordId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.FieldPath,
    isFieldFieldPath,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldFieldPathValue>(
    recordStoreFamilySelector({
      recordId: recordId,
      fieldName: fieldName,
    }),
  );

  const sourceObjectNameSingular = useRecoilValue<FieldTextValue>(
    recordStoreFamilySelector({
      recordId: recordId,
      fieldName: 'sourceObjectNameSingular',
    }),
  );

  const [draftValue, setDraftValue] = useState<FieldFieldPathDraftValue>();

  return {
    draftValue,
    setDraftValue,
    fieldDefinition,
    fieldValue,
    setFieldValue,
    hotkeyScope,
    sourceObjectNameSingular,
  };
};
