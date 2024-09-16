import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { FieldArrayValue } from '@/object-record/record-field/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldArray } from '@/object-record/record-field/types/guards/isFieldArray';
import { arraySchema } from '@/object-record/record-field/types/guards/isFieldArrayValue';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useContext } from 'react';
import { useRecoilState } from 'recoil';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useArrayField = () => {
  const { recordId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.Array, isFieldArray, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldArrayValue>(
    recordStoreFamilySelector({
      recordId,
      fieldName,
    }),
  );

  const persistField = usePersistField();

  const persistArrayField = (nextValue: string[]) => {
    if (!nextValue) persistField(null);

    try {
      persistField(arraySchema.parse(nextValue));
    } catch {
      return;
    }
  };

  return {
    fieldValue,
    setFieldValue,
    persistArrayField,
    hotkeyScope,
  };
};
