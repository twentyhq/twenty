import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { useRecordFieldInput } from '@/object-record/record-field/ui/hooks/useRecordFieldInput';
import { type FieldJsonValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { usePrecomputedJsonDraftValue } from '@/object-record/record-field/ui/meta-types/hooks/usePrecomputedJsonDraftValue';
import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/ui/states/recordFieldInputDraftValueComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldRawJson } from '@/object-record/record-field/ui/types/guards/isFieldRawJson';

export const useJsonField = () => {
  const { recordId, fieldDefinition, maxWidth } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.RAW_JSON,
    isFieldRawJson,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldJsonValue>(
    recordStoreFamilySelector({
      recordId,
      fieldName: fieldName,
    }),
  );

  const { setDraftValue } = useRecordFieldInput<FieldJsonValue>();

  const draftValue = useRecoilComponentValue(
    recordFieldInputDraftValueComponentState,
  );

  const precomputedDraftValue = usePrecomputedJsonDraftValue({
    draftValue,
  });

  return {
    draftValue,
    precomputedDraftValue,
    setDraftValue,
    maxWidth,
    fieldDefinition,
    fieldValue,
    setFieldValue,
  };
};
