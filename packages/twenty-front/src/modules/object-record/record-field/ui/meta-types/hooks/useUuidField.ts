import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { type FieldUUidValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldTextValue } from '@/object-record/record-field/ui/types/guards/isFieldTextValue';
import { isFieldUuid } from '@/object-record/record-field/ui/types/guards/isFieldUuid';
import { recordStoreFamilySelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreFamilySelectorV2';
import { useFamilySelectorStateV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorStateV2';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useUuidField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.UUID, isFieldUuid, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useFamilySelectorStateV2(
    recordStoreFamilySelectorV2,
    { recordId, fieldName },
  );

  const fieldTextValue = isFieldTextValue(fieldValue as FieldUUidValue)
    ? (fieldValue as FieldUUidValue)
    : '';

  return {
    fieldDefinition,
    fieldValue: fieldTextValue,
    setFieldValue,
  };
};
