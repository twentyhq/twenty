import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { usePersistField } from '@/object-record/field/hooks/usePersistField';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { useFieldInitialValue } from '../../hooks/useFieldInitialValue';
import { FieldSelectValue } from '../../types/FieldMetadata';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldSelect } from '../../types/guards/isFieldSelect';
import { isFieldSelectValue } from '../../types/guards/isFieldSelectValue';

export const useSelectField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.Select, isFieldSelect, fieldDefinition);

  const { fieldName } = fieldDefinition.metadata;

  const [fieldValue, setFieldValue] = useRecoilState<FieldSelectValue>(
    recordStoreFamilySelector({
      recordId: entityId,
      fieldName: fieldName,
    }),
  );

  const fieldSelectValue = isFieldSelectValue(fieldValue) ? fieldValue : null;

  const fieldInitialValue = useFieldInitialValue();

  const persistField = usePersistField();

  return {
    fieldDefinition,
    persistField,
    fieldValue: fieldSelectValue,
    initialValue: fieldInitialValue,
    setFieldValue,
    hotkeyScope,
  };
};
