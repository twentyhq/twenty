import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { type FieldUUidValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldTextValue } from '@/object-record/record-field/ui/types/guards/isFieldTextValue';
import { isFieldUuid } from '@/object-record/record-field/ui/types/guards/isFieldUuid';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useUuidField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.UUID, isFieldUuid, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldUUidValue>(
    recordStoreFamilySelector({
      recordId,
      fieldName: fieldName,
    }),
  );
  const fieldTextValue = isFieldTextValue(fieldValue) ? fieldValue : '';

  return {
    fieldDefinition,
    fieldValue: fieldTextValue,
    setFieldValue,
  };
};
