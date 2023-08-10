import { useContext, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';

import { TextInputEdit } from '@/ui/input/text/components/TextInputEdit';
import {
  canBeCastAsIntegerOrNull,
  castAsIntegerOrNull,
} from '~/utils/cast-as-integer-or-null';

import { useRegisterCloseFieldHandlers } from '../hooks/useRegisterCloseFieldHandlers';
import { useUpdateGenericEntityField } from '../hooks/useUpdateGenericEntityField';
import { EditableFieldContext } from '../states/EditableFieldContext';
import { genericEntityFieldFamilySelector } from '../states/genericEntityFieldFamilySelector';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldNumberMetadata } from '../types/FieldMetadata';

export function GenericEditableNumberFieldEditMode() {
  const currentEditableField = useContext(EditableFieldContext);
  const currentEditableFieldEntityId = currentEditableField.entityId;
  const currentEditableFieldDefinition =
    currentEditableField.fieldDefinition as FieldDefinition<FieldNumberMetadata>;

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<number | null>(
    genericEntityFieldFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: currentEditableFieldDefinition
        ? currentEditableFieldDefinition.metadata.fieldName
        : '',
    }),
  );
  const [internalValue, setInternalValue] = useState(
    fieldValue ? fieldValue.toString() : '',
  );

  const updateField = useUpdateGenericEntityField();

  const wrapperRef = useRef(null);

  useRegisterCloseFieldHandlers(wrapperRef, handleSubmit, onCancel);

  function handleSubmit() {
    if (!canBeCastAsIntegerOrNull(internalValue)) {
      return;
    }
    if (internalValue === fieldValue) return;

    setFieldValue(castAsIntegerOrNull(internalValue));

    if (currentEditableFieldEntityId && updateField) {
      updateField(
        currentEditableFieldEntityId,
        currentEditableFieldDefinition,
        castAsIntegerOrNull(internalValue),
      );
    }
  }

  function onCancel() {
    setFieldValue(fieldValue);
  }

  function handleChange(newValue: string) {
    setInternalValue(newValue);
  }

  return (
    <div ref={wrapperRef}>
      <TextInputEdit
        autoFocus
        value={internalValue ? internalValue.toString() : ''}
        onChange={(newValue: string) => {
          handleChange(newValue);
        }}
      />
    </div>
  );
}
