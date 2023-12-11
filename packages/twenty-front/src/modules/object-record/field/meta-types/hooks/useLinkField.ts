import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '../../contexts/FieldContext';
import { useFieldInitialValue } from '../../hooks/useFieldInitialValue';
import { usePersistField } from '../../hooks/usePersistField';
import { entityFieldsFamilySelector } from '../../states/selectors/entityFieldsFamilySelector';
import { FieldLinkValue } from '../../types/FieldMetadata';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldLink } from '../../types/guards/isFieldLink';
import { isFieldLinkValue } from '../../types/guards/isFieldLinkValue';

export const useLinkField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata('LINK', isFieldLink, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldLinkValue>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: fieldName,
    }),
  );

  const fieldInitialValue = useFieldInitialValue();

  const initialValue: FieldLinkValue = fieldInitialValue?.isEmpty
    ? { url: '', label: '' }
    : fieldInitialValue?.value
      ? { url: fieldInitialValue.value, label: '' }
      : fieldValue;

  const persistField = usePersistField();

  const persistLinkField = (newValue: FieldLinkValue) => {
    if (!isFieldLinkValue(newValue)) {
      return;
    }

    persistField(newValue);
  };

  return {
    fieldDefinition,
    fieldValue,
    initialValue,
    setFieldValue,
    hotkeyScope,
    persistLinkField,
  };
};
