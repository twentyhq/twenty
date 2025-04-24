import { useContext } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { FieldJsonValue } from '@/object-record/record-field/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { usePrecomputedJsonDraftValue } from '@/object-record/record-field/meta-types/hooks/usePrecomputedJsonDraftValue';
import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldRawJson } from '../../types/guards/isFieldRawJson';

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

  const persistField = usePersistField();

  const persistJsonField = (nextValue: string) => {
    const skipPersisting =
      fieldDefinition.metadata.objectMetadataNameSingular ===
        CoreObjectNameSingular.WorkflowRun &&
      (fieldDefinition.metadata.fieldName === 'output' ||
        fieldDefinition.metadata.fieldName === 'context');

    if (skipPersisting) {
      return;
    }

    if (!nextValue) persistField(null);

    try {
      persistField(JSON.parse(nextValue));
    } catch {
      // Do nothing
    }
  };

  const { setDraftValue, getDraftValueSelector } =
    useRecordFieldInput<FieldJsonValue>();

  const draftValue = useRecoilValue(getDraftValueSelector());

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
    persistJsonField,
  };
};
