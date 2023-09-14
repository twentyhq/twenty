import { useContext } from 'react';

import { TextInput } from '@/ui/input/components/TextInput';
import { useGenericTextFieldInContext } from '@/ui/table/hooks/useGenericTextFieldInContext';

import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../contexts/EditableFieldEntityIdContext';
import { useFieldInputEventHandlers } from '../hooks/useFieldInputEventHandlers';
import { EditableFieldHotkeyScope } from '../types/EditableFieldHotkeyScope';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldTextMetadata } from '../types/FieldMetadata';

export function GenericEditableTextFieldEditMode() {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldTextMetadata>;

  const { fieldValue, setFieldValue, updateField } =
    useGenericTextFieldInContext();

  function handleSubmit(newValue: string) {
    if (currentEditableFieldEntityId && updateField) {
      setFieldValue(newValue);
      updateField(newValue);
    }
  }

  const { handleEnter, handleEscape, handleClickOutside } =
    useFieldInputEventHandlers({
      onSubmit: handleSubmit,
    });

  return (
    <TextInput
      placeholder={currentEditableFieldDefinition.metadata.placeHolder}
      autoFocus
      value={fieldValue ?? ''}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      hotkeyScope={EditableFieldHotkeyScope.EditableField}
    />
  );
}
