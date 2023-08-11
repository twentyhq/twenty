import { useContext, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';

import { TextInputEdit } from '@/ui/input/text/components/TextInputEdit';

import { useRegisterCloseFieldHandlers } from '../hooks/useRegisterCloseFieldHandlers';
import { useUpdateGenericEntityField } from '../hooks/useUpdateGenericEntityField';
import { EditableFieldDefinitionContext } from '../states/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../states/EditableFieldEntityIdContext';
import { genericEntityFieldFamilySelector } from '../states/genericEntityFieldFamilySelector';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldURLMetadata } from '../types/FieldMetadata';

// This one is very similar to GenericEditableTextFieldEditMode
// We could probably merge them since FieldURLMetadata is basically a FieldTextMetadata
export function GenericEditableURLFieldEditMode() {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldURLMetadata>;

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
