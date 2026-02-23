import { useContext } from 'react';

import { recordStoreFamilySelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreFamilySelectorV2';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldBoolean } from '@/object-record/record-field/ui/types/guards/isFieldBoolean';
import { useFamilySelectorStateV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorStateV2';

export const useBooleanField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.BOOLEAN,
    isFieldBoolean,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useFamilySelectorStateV2(
    recordStoreFamilySelectorV2,
    { recordId, fieldName },
  );

  const typedFieldValue = fieldValue as boolean;

  return {
    fieldDefinition,
    fieldValue: typedFieldValue,
    setFieldValue,
  };
};
