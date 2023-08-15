import { useContext, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';

import { TextInputEdit } from '@/ui/input/text/components/TextInputEdit';

import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../contexts/EditableFieldEntityIdContext';
import { useRegisterCloseFieldHandlers } from '../hooks/useRegisterCloseFieldHandlers';
import { useUpdateGenericEntityField } from '../hooks/useUpdateGenericEntityField';
import { genericEntityFieldFamilySelector } from '../states/selectors/genericEntityFieldFamilySelector';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldTextMetadata } from '../types/FieldMetadata';

export function GenericEditableTextFieldEditMode() {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldTextMetadata>;

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<string>(
    genericEntityFieldFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: currentEditableFieldDefinition
        ? currentEditableFieldDefinition.metadata.fieldName
        : '',
    }),
  );

  const [internalValue, setInternalValue] = useState(fieldValue);

  const updateField = useUpdateGenericEntityField();

  const wrapperRef = useRef(null);

  useRegisterCloseFieldHandlers(wrapperRef, handleSubmit, onCancel);

  function handleSubmit() {
    if (internalValue === fieldValue) return;

    setFieldValue(internalValue);

    if (currentEditableFieldEntityId && updateField) {
      updateField(
        currentEditableFieldEntityId,
        currentEditableFieldDefinition,
        internalValue,
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
        placeholder={currentEditableFieldDefinition.metadata.placeHolder}
        value={internalValue}
        onChange={(newValue: string) => {
          handleChange(newValue);
        }}
      />
    </div>
  );
}
