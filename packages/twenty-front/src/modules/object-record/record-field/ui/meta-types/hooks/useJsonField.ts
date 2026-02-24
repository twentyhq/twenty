import { useContext } from 'react';

import { useRecordFieldInput } from '@/object-record/record-field/ui/hooks/useRecordFieldInput';
import { type FieldJsonValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilySelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreFamilySelectorV2';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { usePrecomputedJsonDraftValue } from '@/object-record/record-field/ui/meta-types/hooks/usePrecomputedJsonDraftValue';
import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/ui/states/recordFieldInputDraftValueComponentState';
import { useFamilySelectorState } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
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

  const [fieldValue, setFieldValue] = useFamilySelectorState(
    recordStoreFamilySelectorV2,
    { recordId, fieldName },
  );

  const { setDraftValue } = useRecordFieldInput<FieldJsonValue>();

  const draftValue = useAtomComponentValue(
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
